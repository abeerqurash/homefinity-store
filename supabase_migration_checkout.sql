-- homefinity.pk: checkout update. Run this whole file once in Supabase > SQL Editor > New query > Run.
-- Safe to run more than once. It does not delete any products, orders or settings.

alter table orders add column if not exists idem_key text;
create unique index if not exists orders_idem_key_uq on orders(idem_key) where idem_key is not null;
create index if not exists orders_phone_time_ix on orders ((customer->>'phone'), created_at desc);

-- the old two-argument version must go, otherwise the store cannot tell the two versions apart
drop function if exists place_order(jsonb,jsonb);

-- Customers place orders ONLY through this function. Prices, stock and customer details are checked here, not in the browser.
-- p_idem is a one-time key made by the browser for each checkout attempt: sending the same key twice returns the first order
-- instead of creating a second one (protects against double taps and retries after a bad connection).
create or replace function place_order(p_customer jsonb, p_items jsonb, p_idem text default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare it jsonb; p products%rowtype; v_sub numeric:=0; v_fee numeric; v_free numeric; v_ship numeric;
        v_items jsonb:='[]'; v_no text; v_token text; v_q int; v_total numeric; ex orders%rowtype;
        v_name text; v_phone text; v_city text; v_addr text; v_email text; v_cust jsonb;
        v_prov text; v_area text; v_land text; v_post text; v_note text;
begin
  -- hidden "honeypot" field: real customers never fill it in, simple bots do
  if coalesce(p_customer->>'hp','')<>'' then raise exception 'Something went wrong. Please try again.'; end if;

  if p_idem is not null then
    if length(p_idem) not between 16 and 80 then raise exception 'Invalid request. Please refresh the page and try again.'; end if;
    perform pg_advisory_xact_lock(hashtext(p_idem));   -- two requests with the same key run one after the other
    select * into ex from orders where idem_key = p_idem;
    if found then return jsonb_build_object('order_no',ex.order_no,'token',ex.token,'total',ex.total,'duplicate',true); end if;
  end if;

  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Your cart is empty'; end if;

  v_name  := regexp_replace(trim(coalesce(p_customer->>'name','')),'\s+',' ','g');
  v_city  := regexp_replace(trim(coalesce(p_customer->>'city','')),'\s+',' ','g');
  v_addr  := regexp_replace(trim(coalesce(p_customer->>'addr','')),'\s+',' ','g');
  v_email := lower(trim(coalesce(p_customer->>'email','')));
  v_prov  := trim(coalesce(p_customer->>'province',''));
  v_area  := regexp_replace(trim(coalesce(p_customer->>'area','')),'\s+',' ','g');
  v_land  := regexp_replace(trim(coalesce(p_customer->>'landmark','')),'\s+',' ','g');
  v_post  := regexp_replace(coalesce(p_customer->>'postal',''),'\s','','g');
  v_note  := regexp_replace(trim(coalesce(p_customer->>'note','')),'\s+',' ','g');
  v_phone := regexp_replace(coalesce(p_customer->>'phone',''),'\D','','g');
  if v_phone ~ '^0092' then v_phone := '0'||substr(v_phone,5);
  elsif v_phone ~ '^92' then v_phone := '0'||substr(v_phone,3);
  elsif v_phone !~ '^0' then v_phone := '0'||v_phone; end if;

  if length(v_name) not between 2 and 80 or v_name !~ '[[:alpha:]]' then raise exception 'Please enter your full name'; end if;
  if not (v_phone ~ '^03[0-9]{9}$' or v_phone ~ '^0[12456789][0-9]{8,9}$') then raise exception 'Please enter a valid phone number, for example 0300 1234567'; end if;
  if length(v_city) not between 2 and 60 or v_city !~ '[[:alpha:]]{2}' then raise exception 'Please enter your city'; end if;
  if v_prov not in ('Sindh','Punjab','Khyber Pakhtunkhwa','Balochistan','Islamabad Capital Territory','Azad Jammu & Kashmir','Gilgit-Baltistan') then raise exception 'Please choose your province'; end if;
  if length(v_area) not between 2 and 80 or v_area !~ '[[:alpha:]]' then raise exception 'Please enter your area or neighbourhood'; end if;
  if length(v_addr) not between 6 and 200 or v_addr !~ '[[:alpha:]]' then raise exception 'Please enter your house or flat number and street'; end if;
  if length(v_land)>100 then raise exception 'Landmark is too long'; end if;
  if v_post<>'' and v_post !~ '^[0-9]{5}$' then raise exception 'Postal code should be 5 digits'; end if;
  if length(v_note)>300 then raise exception 'Delivery note is too long'; end if;
  if v_email<>'' and (length(v_email)>120 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then raise exception 'That email address does not look right'; end if;

  -- simple spam brake: at most 3 live orders per phone number per hour
  if (select count(*) from orders where customer->>'phone' = v_phone and created_at > now() - interval '1 hour' and status <> 'Cancelled') >= 3 then
    raise exception 'We already have several recent orders from this phone number. Please contact us to place another order.';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    v_q := (it->>'q')::int;
    if v_q < 1 or v_q > 20 then raise exception 'Invalid quantity'; end if;
    select * into p from products where id = (it->>'id')::bigint and active for update;
    if not found then raise exception 'A product in your cart is no longer available'; end if;
    if p.stock < v_q then raise exception 'Only % left of %', p.stock, p.name; end if;
    update products set stock = stock - v_q where id = p.id;
    v_sub := v_sub + p.price * v_q;
    v_items := v_items || jsonb_build_object('id',p.id,'name',p.name,'price',p.price,'q',v_q);
  end loop;
  select coalesce((select value::numeric from settings where key='ship_fee'),200),
         coalesce((select value::numeric from settings where key='free_over'),3000) into v_fee, v_free;
  v_ship := case when v_sub >= v_free then 0 else v_fee end; v_total := v_sub + v_ship;

  v_cust := jsonb_build_object('name',v_name,'phone',v_phone,'province',v_prov,'city',v_city,'area',v_area,'addr',v_addr)
            || case when v_email<>'' then jsonb_build_object('email',v_email) else '{}'::jsonb end
            || case when v_land<>''  then jsonb_build_object('landmark',v_land) else '{}'::jsonb end
            || case when v_post<>''  then jsonb_build_object('postal',v_post) else '{}'::jsonb end
            || case when v_note<>''  then jsonb_build_object('note',v_note) else '{}'::jsonb end;
  v_no := 'NC-' || nextval('order_seq');
  v_token := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
  insert into orders(order_no,token,customer,items,subtotal,shipping,total,idem_key)
    values (v_no,v_token,v_cust,v_items,v_sub,v_ship,v_total,p_idem);
  insert into order_events(order_no,status) values (v_no,'Placed');
  return jsonb_build_object('order_no',v_no,'token',v_token,'total',v_total);
end $$;

-- Customers track an order with the secret token only (no personal data returned).
create or replace function track_order(p_token text) returns jsonb
language sql security definer set search_path=public stable as $$
  select jsonb_build_object('order_no',o.order_no,'status',o.status,'total',o.total,'subtotal',o.subtotal,'shipping',o.shipping,
    'payment_method',o.payment_method,'created_at',o.created_at,
    'items',(select coalesce(jsonb_agg(jsonb_build_object('name',i->>'name','price',(i->>'price')::numeric,'q',(i->>'q')::int)),'[]'::jsonb)
             from jsonb_array_elements(o.items) i),
    'events',(select coalesce(jsonb_agg(jsonb_build_object('status',e.status,'created_at',e.created_at) order by e.id),'[]')
              from order_events e where e.order_no=o.order_no))
  from orders o where o.token = p_token $$;

-- Staff change order status; every change is logged. Cancelling puts stock back. A cancelled order is final.
create or replace function set_order_status(p_order_no text, p_status text) returns void
language plpgsql security definer set search_path=public as $$
declare o orders%rowtype; it jsonb;
begin
  if not is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('Placed','Confirmed','Packed','Dispatched','Delivered','Cancelled') then raise exception 'Unknown status'; end if;
  select * into o from orders where order_no=p_order_no for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status='Cancelled' then raise exception 'A cancelled order cannot be changed'; end if;
  if p_status='Cancelled' then
    for it in select * from jsonb_array_elements(o.items) loop
      update products set stock = stock + (it->>'q')::int where id=(it->>'id')::bigint; end loop;
  end if;
  update orders set status=p_status where order_no=p_order_no;
  insert into order_events(order_no,status) values (p_order_no,p_status);
end $$;

grant execute on function place_order(jsonb,jsonb,text) to anon, authenticated;
grant execute on function track_order(text) to anon, authenticated;
grant execute on function set_order_status(text,text) to authenticated;

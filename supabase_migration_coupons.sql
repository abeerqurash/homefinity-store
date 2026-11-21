-- homefinity.pk: coupons (percentage, fixed amount, free delivery).
-- Run this whole file once in Supabase > SQL Editor > New query > Run.
-- Safe to run more than once. It keeps all your products, orders and settings.
-- Run it AFTER supabase_schema.sql and the checkout / variants migrations.

-- 1) Coupons table. Only admins can read or change it; customers check a code through validate_coupon() below.
create table if not exists coupons (
  code text primary key check (code ~ '^[A-Z0-9_-]{3,20}$'),
  type text not null check (type in ('percent','fixed','freeship')),
  value numeric(10,2) not null default 0 check (value >= 0),
  min_order numeric(10,2) not null default 0 check (min_order >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit >= 1),
  used_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (type = 'freeship' or value > 0),
  check (type <> 'percent' or value <= 100)
);
alter table coupons enable row level security;
drop policy if exists "admin manages coupons" on coupons;
create policy "admin manages coupons" on coupons for all using (is_admin()) with check (is_admin());

-- 2) Orders remember which coupon was used and how much it took off.
alter table orders add column if not exists discount numeric(10,2) not null default 0;
alter table orders add column if not exists coupon text;

-- 3) The cart asks this before showing a discount. It only says yes/no and the rules; place_order() checks everything again.
create or replace function validate_coupon(p_code text, p_subtotal numeric) returns jsonb
language plpgsql security definer set search_path=public stable as $$
declare c coupons%rowtype; v_code text := upper(trim(coalesce(p_code,'')));
begin
  if v_code = '' then return jsonb_build_object('ok',false,'message','Enter a coupon code.'); end if;
  select * into c from coupons where code = v_code;
  if not found or not c.active then return jsonb_build_object('ok',false,'message','That coupon code is not valid.'); end if;
  if c.starts_at is not null and now() < c.starts_at then return jsonb_build_object('ok',false,'message','That coupon is not active yet.'); end if;
  if c.ends_at is not null and now() > c.ends_at then return jsonb_build_object('ok',false,'message','That coupon has expired.'); end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then return jsonb_build_object('ok',false,'message','That coupon has been fully used.'); end if;
  if coalesce(p_subtotal,0) < c.min_order then
    return jsonb_build_object('ok',false,'message','This coupon needs an order of at least Rs. '||c.min_order::bigint||'.'); end if;
  return jsonb_build_object('ok',true,'code',c.code,'type',c.type,'value',c.value,'min',c.min_order);
end $$;
grant execute on function validate_coupon(text,numeric) to anon, authenticated;

-- 4) Placing an order now accepts an optional coupon code (new last argument).
drop function if exists place_order(jsonb,jsonb,text);
create or replace function place_order(p_customer jsonb, p_items jsonb, p_idem text default null, p_coupon text default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare it jsonb; p products%rowtype; v_var jsonb; v_vid text; v_price numeric; v_sub numeric:=0; v_fee numeric; v_free numeric; v_ship numeric;
        v_items jsonb:='[]'; v_no text; v_token text; v_q int; v_total numeric; ex orders%rowtype;
        v_name text; v_phone text; v_city text; v_addr text; v_email text; v_cust jsonb;
        v_prov text; v_area text; v_land text; v_post text; v_note text;
        v_disc numeric:=0; cp coupons%rowtype; v_cc text;
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
    v_vid := nullif(it->>'v','');
    if jsonb_array_length(p.variants) > 0 then
      -- product has options (colour / size): the customer must have picked one, and its own stock and price are used
      if v_vid is null then raise exception 'Please choose an option for %', p.name; end if;
      select x into v_var from jsonb_array_elements(p.variants) x where x->>'id' = v_vid;
      if v_var is null then raise exception 'That option of % is no longer available', p.name; end if;
      if coalesce((v_var->>'stock')::int,0) < v_q then
        raise exception 'Only % left of % (%)', coalesce((v_var->>'stock')::int,0), p.name, v_var->>'label'; end if;
      v_price := coalesce(nullif(v_var->>'price','')::numeric, p.price);
      update products set variants = (
          select jsonb_agg(case when x->>'id' = v_vid then jsonb_set(x,'{stock}',to_jsonb((x->>'stock')::int - v_q)) else x end order by ord)
          from jsonb_array_elements(variants) with ordinality as t(x,ord))
        where id = p.id;   -- the products trigger recalculates the product's total stock
      v_items := v_items || jsonb_build_object('id',p.id,'name',p.name,'price',v_price,'q',v_q,'v',v_vid,'vl',v_var->>'label','sku',v_var->>'sku');
    else
      if p.stock < v_q then raise exception 'Only % left of %', p.stock, p.name; end if;
      update products set stock = stock - v_q where id = p.id;
      v_price := p.price;
      v_items := v_items || jsonb_build_object('id',p.id,'name',p.name,'price',p.price,'q',v_q);
    end if;
    v_sub := v_sub + v_price * v_q;
  end loop;
  select coalesce((select value::numeric from settings where key='ship_fee'),200),
         coalesce((select value::numeric from settings where key='free_over'),3000) into v_fee, v_free;
  v_ship := case when v_sub >= v_free then 0 else v_fee end;

  -- coupon: checked again here on the server, so the browser cannot invent or change a discount
  v_cc := upper(trim(coalesce(p_coupon,'')));
  if v_cc <> '' then
    select * into cp from coupons where code = v_cc for update;   -- locks the row so two orders cannot both use the last allowed use
    if not found or not cp.active then raise exception 'That coupon code is not valid.'; end if;
    if cp.starts_at is not null and now() < cp.starts_at then raise exception 'That coupon is not active yet.'; end if;
    if cp.ends_at is not null and now() > cp.ends_at then raise exception 'That coupon has expired.'; end if;
    if cp.usage_limit is not null and cp.used_count >= cp.usage_limit then raise exception 'That coupon has been fully used.'; end if;
    if v_sub < cp.min_order then raise exception 'This coupon needs an order of at least Rs. %.', cp.min_order::bigint; end if;
    if cp.type = 'percent' then v_disc := least(v_sub, floor(v_sub * least(cp.value,100) / 100));
    elsif cp.type = 'fixed' then v_disc := least(v_sub, floor(cp.value));
    else v_ship := 0; end if;   -- free delivery
    update coupons set used_count = used_count + 1 where code = v_cc;
  end if;
  v_total := v_sub - v_disc + v_ship;

  v_cust := jsonb_build_object('name',v_name,'phone',v_phone,'province',v_prov,'city',v_city,'area',v_area,'addr',v_addr)
            || case when v_email<>'' then jsonb_build_object('email',v_email) else '{}'::jsonb end
            || case when v_land<>''  then jsonb_build_object('landmark',v_land) else '{}'::jsonb end
            || case when v_post<>''  then jsonb_build_object('postal',v_post) else '{}'::jsonb end
            || case when v_note<>''  then jsonb_build_object('note',v_note) else '{}'::jsonb end;
  v_no := 'NC-' || nextval('order_seq');
  v_token := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
  insert into orders(order_no,token,customer,items,subtotal,shipping,discount,coupon,total,idem_key)
    values (v_no,v_token,v_cust,v_items,v_sub,v_ship,v_disc,nullif(v_cc,''),v_total,p_idem);
  insert into order_events(order_no,status) values (v_no,'Placed');
  return jsonb_build_object('order_no',v_no,'token',v_token,'total',v_total);
end $$;
grant execute on function place_order(jsonb,jsonb,text,text) to anon, authenticated;

-- 5) The order tracking page also shows the discount.
create or replace function track_order(p_token text) returns jsonb
language sql security definer set search_path=public stable as $$
  select jsonb_build_object('order_no',o.order_no,'status',o.status,'total',o.total,'subtotal',o.subtotal,'discount',o.discount,'coupon',o.coupon,'shipping',o.shipping,
    'payment_method',o.payment_method,'created_at',o.created_at,
    'items',(select coalesce(jsonb_agg(jsonb_build_object('name',i->>'name','vl',i->>'vl','price',(i->>'price')::numeric,'q',(i->>'q')::int)),'[]'::jsonb)
             from jsonb_array_elements(o.items) i),
    'events',(select coalesce(jsonb_agg(jsonb_build_object('status',e.status,'created_at',e.created_at) order by e.id),'[]')
              from order_events e where e.order_no=o.order_no))
  from orders o where o.token = p_token $$;

-- Staff change order status; every change is logged. Cancelling puts stock back. A cancelled order is final.
create or replace function set_order_status(p_order_no text, p_status text) returns void
language plpgsql security definer set search_path=public as $$
declare o orders%rowtype; it jsonb; v_vid text; v_q int;
begin
  if not is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('Placed','Confirmed','Packed','Dispatched','Delivered','Cancelled') then raise exception 'Unknown status'; end if;
  select * into o from orders where order_no=p_order_no for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status='Cancelled' then raise exception 'A cancelled order cannot be changed'; end if;
  if p_status='Cancelled' then
    for it in select * from jsonb_array_elements(o.items) loop
      v_vid := nullif(it->>'v',''); v_q := (it->>'q')::int;
      if v_vid is not null then
        -- put the stock back on the same option (skipped if the admin has since deleted that option)
        update products set variants = (
            select jsonb_agg(case when x->>'id' = v_vid then jsonb_set(x,'{stock}',to_jsonb((x->>'stock')::int + v_q)) else x end order by ord)
            from jsonb_array_elements(variants) with ordinality as t(x,ord))
          where id=(it->>'id')::bigint and jsonb_array_length(variants) > 0;
      else
        update products set stock = stock + v_q where id=(it->>'id')::bigint;
      end if;
    end loop;
  end if;
  update orders set status=p_status where order_no=p_order_no;
  insert into order_events(order_no,status) values (p_order_no,p_status);
end $$;
grant execute on function track_order(text) to anon, authenticated;

-- 6) Cancelling an order gives its coupon use back.
create or replace function set_order_status(p_order_no text, p_status text) returns void
language plpgsql security definer set search_path=public as $$
declare o orders%rowtype; it jsonb; v_vid text; v_q int;
begin
  if not is_admin() then raise exception 'Not allowed'; end if;
  if p_status not in ('Placed','Confirmed','Packed','Dispatched','Delivered','Cancelled') then raise exception 'Unknown status'; end if;
  select * into o from orders where order_no=p_order_no for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status='Cancelled' then raise exception 'A cancelled order cannot be changed'; end if;
  if p_status='Cancelled' then
    if o.coupon is not null then update coupons set used_count = greatest(used_count - 1, 0) where code = o.coupon; end if;   -- the coupon use is given back
    for it in select * from jsonb_array_elements(o.items) loop
      v_vid := nullif(it->>'v',''); v_q := (it->>'q')::int;
      if v_vid is not null then
        -- put the stock back on the same option (skipped if the admin has since deleted that option)
        update products set variants = (
            select jsonb_agg(case when x->>'id' = v_vid then jsonb_set(x,'{stock}',to_jsonb((x->>'stock')::int + v_q)) else x end order by ord)
            from jsonb_array_elements(variants) with ordinality as t(x,ord))
          where id=(it->>'id')::bigint and jsonb_array_length(variants) > 0;
      else
        update products set stock = stock + v_q where id=(it->>'id')::bigint;
      end if;
    end loop;
  end if;
  update orders set status=p_status where order_no=p_order_no;
  insert into order_events(order_no,status) values (p_order_no,p_status);
end $$;
grant execute on function set_order_status(text,text) to authenticated;

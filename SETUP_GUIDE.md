# homefinity.pk – Step 4 setup guide (beginner)

You will connect your store to a free Supabase database. It takes about 20 minutes.

## 1. Create the database
1. Go to supabase.com and create a free account.
2. Click **New project**. Name it, set a database password (save it) and pick the nearest region.
3. Wait until the project is ready.

## 2. Install the store tables
1. In your project, open **SQL Editor** > **New query**.
2. Open `supabase_schema.sql`, copy everything, paste it in and click **Run**.
3. You should see "Success". This creates products, orders, settings, enquiries, security rules and the photo storage.

### Already set up the store before the checkout update?
Do NOT run `supabase_schema.sql` again. Open **SQL Editor** > **New query**, paste everything from `supabase_migration_checkout.sql`, and click **Run**.
Your products and orders are kept. Do this before you upload the new site files, because the new cart and checkout will not work without it.
If you already ran an earlier version of this file, run the new one again. It is safe to run more than once.

### Product options (colour / size) update
Run this once after the step above. Open **SQL Editor** > **New query**, paste everything from `supabase_migration_variants.sql` and click **Run**.
- New installs: `supabase_schema.sql` already includes it, so you do not need this file.
- Existing installs: run `supabase_migration_checkout.sql` first if you have not, then this file. It is safe to run more than once and keeps your products and orders. Do it before you upload the new site files.


### Categories and rich text descriptions update
Run this once. Open **SQL Editor** > **New query**, paste everything from `supabase_migration_categories.sql` and click **Run**. It is safe to run more than once and keeps your products and orders. Do it before you upload the new site files.
- **Admin > Categories**: add, rename, reorder and delete product categories. Renaming a category updates all its products. A category that still has products cannot be deleted.
- **Admin > Products**: Category is now a dropdown filled from your categories. "Full description" and "Additional information" are rich text editors (Heading 2, Heading 3, bold, italic, lists, quote, link). The product name is the page's single H1; headings you add in the editors are H2/H3 and show below the product. Additional information appears under its own "Additional information" H2.

## 3. Create your admin login
1. Go to **Authentication** > **Users** > **Add user** > **Create new user**. Enter your email and a strong password. Tick "Auto confirm user".
2. Go to **SQL Editor** and run this (use your own email):
   ```sql
   insert into admins(user_id) select id from auth.users where email = 'you@example.com';
   ```
3. Also go to **Authentication** > **Sign In / Providers** and turn OFF "Allow new users to sign up", so nobody else can create accounts.

## 4. Connect the page
1. Go to **Project Settings** > **API**. Copy the **Project URL** and the **anon public key**.
2. Open `assets/config.js` in a text editor (VS Code). It is the only file that needs your details.
3. Fill it in:
   `window.NC_CONFIG={url:"https://YOURPROJECT.supabase.co",key:"YOUR-ANON-KEY"};`
4. Save the file. The same settings apply to every page. The anon key is meant to be public. The security rules in step 2 protect your data.
   NEVER put the "service_role" key in this file.

## 5. Add your products
1. Open the store, then click **Admin** in the footer (or add `#admin` to the address).
2. Log in with the email and password from step 3.
3. Go to the **Products** tab and add each product with its name, category, price, stock and photos.
   **Options (colour, size, capacity):** in the product form, write one option per line as `Name | stock | price | SKU | photo number`. Price, SKU and photo number are optional. Example: `Pink | 12 | 1500 | NICE-PNK | 2`. Leave the price empty to use the product price. The photo number is the position of the product photo to show when that option is chosen. When a product has options, its stock is the total of the options and the Stock box is ignored. Options are matched by name, so if you rename one, shoppers who already have the old name in their cart will see it removed.
   Photos are uploaded to your Supabase storage.
4. The first three categories fill the three shop accordions on the home page.

## 6. Test an order
1. Open the store in a private window and add a product. Open **View full cart** (`cart.html`), change the quantity, then press **Proceed to checkout** (`checkout.html`).
2. Fill in the form and place a cash-on-delivery order. You land on the order page (`order.html`). Copy the tracking link from there. Open it in another browser to check it works.
3. In Admin > Orders, change the status, then press **Refresh status** on the order page.
4. Try pressing **Place order** twice quickly: only one order should appear in Admin > Orders.

## Notes
- Prices and stock are checked on the server. A customer cannot change a price.
- Delivery fee and free-delivery limit are in the `settings` table (`ship_fee`, `free_over`). Change them in **Table Editor**.
- Enquiries from the contact form are in **Table Editor** > `enquiries`.
- With `url` left empty, the store runs in demo mode (data stays in your browser only).
- To put the store online you need hosting. Any static host works (Netlify, Cloudflare Pages, or normal web hosting).
- Checkout is a full page. It collects name, phone, optional email, province, city, area, house and street, optional postal code, landmark and delivery instructions, and requires a tick to confirm. Everything is checked on the page and again on the server, and the full address shows in Admin > Orders.
- The cart is a full page too, with quantity controls, delivery and total. The cart drawer is still there for quick access and now links to it.
- The same phone number can place at most 3 live orders per hour. Change this in the `place_order` function if it is too strict.
- Customers are not emailed or messaged yet. The order page lets them copy the link, send it to themselves on WhatsApp or email, and remembers it in their browser.
- Not built yet: online card payments, customer accounts, returns and refunds, automatic email or SMS notifications, coupons, delivery zones (delivery is one flat fee).

### Coupons update
Run this once. Open **SQL Editor** > **New query**, paste everything from `supabase_migration_coupons.sql` and click **Run**. It is safe to run more than once and keeps your products and orders. Do it before you upload the new site files, because the new cart sends the coupon code to this function.
- New installs: `supabase_schema.sql` already includes it, so you do not need this file.
- **Admin > Coupons**: create percentage, fixed-amount or free-delivery codes with an optional minimum order, start and end date and usage limit. You can disable, re-enable or delete a code at any time.
- Customers enter the code in the cart. The discount is checked again on the server when the order is placed, so it cannot be changed in the browser.
- Cancelling an order gives its coupon use back.
- Test it: create a code in Admin > Coupons, add items to a cart, apply the code, place an order, and check that the admin order and the printed packing slip show the discount.

### Search engines (SEO)
1. **Set your real address once.** Open `assets/config.js` and add one line inside `window.HF={ ... }`: `siteUrl:"https://homefinity.pk",` (use your real address, no slash at the end). Optionally add `ogImage:"https://homefinity.pk/assets/share.jpg",` with a picture (about 1200x630) to show when your links are shared. If you skip `siteUrl`, the site uses the address it is opened from.
2. **Upload `robots.txt` and `sitemap.xml`** to your website's main folder. If your address is not `https://homefinity.pk`, edit the `Sitemap:` line in `robots.txt`.
3. **Make a full sitemap:** Admin > Settings > Search engines > **Download sitemap.xml**. It lists every page and every product. Upload it in place of `sitemap.xml`, and do this again after you add or remove products.
4. **Tell Google:** In Google Search Console add your site, then Sitemaps > add `sitemap.xml`.
5. Every page now has a canonical link and social-sharing tags. Product pages also carry Product and breadcrumb data, with price, stock status and photos taken from your catalogue. Cart, checkout, order and tracking pages are marked "do not index".

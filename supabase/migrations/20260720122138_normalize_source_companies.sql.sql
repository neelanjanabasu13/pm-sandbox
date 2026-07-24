-- Normalize source_company values: merge aliases, typos, and casing variants
-- into canonical company names.

UPDATE questions SET source_company = '7Shifts' WHERE source_company ILIKE '7shifts';
UPDATE questions SET source_company = 'Adobe' WHERE source_company ILIKE 'adobe';
UPDATE questions SET source_company = 'Affirm' WHERE source_company ILIKE 'affirm';
UPDATE questions SET source_company = 'Amazon' WHERE source_company IN ('Amazon AWS', 'AWS', 'amazon', 'Amazxon', 'Amzon', 'Google/Amazon');
UPDATE questions SET source_company = 'Anthropic' WHERE source_company IN ('Anhtropic');
UPDATE questions SET source_company = 'Capital One' WHERE source_company IN ('Capital one', 'CapitalOne');
UPDATE questions SET source_company = 'Cisco' WHERE source_company = 'Cisco Meraki';
UPDATE questions SET source_company = 'DocuSign' WHERE source_company ILIKE 'docusign';
UPDATE questions SET source_company = 'DoorDash' WHERE source_company IN ('Door Dash', 'doordash', 'Doordash');
UPDATE questions SET source_company = 'eBay' WHERE source_company IN ('ebay', 'Ebay');
UPDATE questions SET source_company = 'Google' WHERE source_company IN ('google', 'Google (GCP)', 'Google Cloud', 'Google`', 'Googlw', 'StraGoogletegic Insights');
UPDATE questions SET source_company = 'Intuit' WHERE source_company IN ('Intuit Mailchimp', 'Inuit');
UPDATE questions SET source_company = 'LinkedIn' WHERE source_company IN ('Linkedin', 'LInkedIn');
UPDATE questions SET source_company = 'Lyft' WHERE source_company = 'lyft';
UPDATE questions SET source_company = 'Meta' WHERE source_company IN (
  'Facbook', 'facebook', 'Facebook', 'FaceBook', 'FACEBOOK',
  'Facebook/Meta', 'Faceboook', 'fb', 'FB',
  'meta', 'MEta', 'META', 'Meta (team match)',
  'Meta / Facebook', 'Meta/ Facebook', 'Meta/Facebook'
);
UPDATE questions SET source_company = 'Microsoft' WHERE source_company IN ('MICROSOFT', 'Microsoft Round 1');
UPDATE questions SET source_company = 'Monday.com' WHERE source_company IN ('Monday,com');
UPDATE questions SET source_company = 'Nubank' WHERE source_company = 'Nu Bank';
UPDATE questions SET source_company = 'PayPal' WHERE source_company IN ('Paypal', 'Paypal/Venmo', 'Venmo/ Paypal');
UPDATE questions SET source_company = 'Snap' WHERE source_company = 'Snap Inc.';
UPDATE questions SET source_company = 'SoFi' WHERE source_company = 'Sofi';
UPDATE questions SET source_company = 'Swiggy' WHERE source_company IN ('Swiggy - India Food tech', 'Swiggy - India Food Tech');
UPDATE questions SET source_company = 'T-Mobile' WHERE source_company IN ('T-mobile', 'TMobile');
UPDATE questions SET source_company = 'TikTok' WHERE source_company IN ('Tik Tok', 'Tiktok');
UPDATE questions SET source_company = 'Venmo' WHERE source_company = 'Venmo';
UPDATE questions SET source_company = 'Walmart' WHERE source_company = 'Walmart E-commerce';
UPDATE questions SET source_company = 'Wayfair' WHERE source_company = 'wayfair';
UPDATE questions SET source_company = 'YouTube' WHERE source_company = 'Youtube';

-- Clean up non-company junk entries
UPDATE questions SET source_company = 'Other' WHERE source_company IN (
  '<>', 'Na', 'NA', 'Spoke in circles format',
  'Afraaz Masters', 'Yasir Noor',
  'Masters Union PM Bootcamp',
  'Navi (fintech startup in India founded by ex Flipkart)',
  'Fintech ( forgot the name)',
  'eCommerce startup'
);

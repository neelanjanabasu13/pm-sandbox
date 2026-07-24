-- Second pass: clean up remaining typos and casing inconsistencies

UPDATE questions SET source_company = 'Robinhood' WHERE source_company = 'Robhinhood';
UPDATE questions SET source_company = 'Workboard' WHERE source_company = 'workoard';
UPDATE questions SET source_company = 'Digital Trust' WHERE source_company = 'digital trust';
UPDATE questions SET source_company = 'InMobi' WHERE source_company = 'inmobi';
UPDATE questions SET source_company = 'Udemy' WHERE source_company = 'UDEMY';
UPDATE questions SET source_company = 'Khatabook' WHERE source_company = 'Khata book';
UPDATE questions SET source_company = 'Mutefly' WHERE source_company = 'Mutefly';
UPDATE questions SET source_company = 'Oracle' WHERE source_company = 'Oracle Cloud Infrastructure';
UPDATE questions SET source_company = 'Gojek' WHERE source_company = 'Go Jek';
UPDATE questions SET source_company = 'Bolt.eu' WHERE source_company = 'Bolt․eu';

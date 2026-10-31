ALTER TABLE public.klusbeheer_records DROP CONSTRAINT klusbeheer_records_record_type_check;
ALTER TABLE public.klusbeheer_records ADD CONSTRAINT klusbeheer_records_record_type_check CHECK (record_type = ANY (ARRAY['klant','project','medewerker','uur','materiaal','product','calculatie','werkbon','kwitantie','herinnering','sjabloon','factuur','instellingen']::text[]));
CREATE UNIQUE INDEX klusbeheer_document_number_unique ON public.klusbeheer_records (owner_id, lower(btrim(data->>'nummer'))) WHERE record_type = 'factuur' AND nullif(btrim(data->>'nummer'),'') IS NOT NULL;

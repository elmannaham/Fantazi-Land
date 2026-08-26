-- Seed Data for Fantazi-Land
-- Run: npm run db:seed

-- Insert demo profiles (without user_id since no auth users exist yet)
INSERT INTO profiles (name, category, bio, base_rate, currency, instagram_url, tiktok_url, twitter_url, website_url, is_public, is_available)
VALUES
  (
    'Marina Dupont',
    'Photographie',
    'Photographe spécialisée en mode et lifestyle. 8 ans d''expérience. Disponible pour collaborations internationales.',
    1800,
    'EUR',
    'https://instagram.com/marinadupont',
    'https://tiktok.com/@marinadupont',
    'https://twitter.com/marinadupont',
    'https://marinadupont.com',
    true,
    true
  ),
  (
    'Sophie Martin',
    'Vidéographie',
    'Vidéaste créative spécialisée dans les clips musicaux et publicités. Matériel professionnel 4K/8K.',
    2000,
    'EUR',
    'https://instagram.com/sophiemartin',
    NULL,
    NULL,
    'https://sophiemartin.studio',
    true,
    true
  ),
  (
    'Léa Beaumont',
    'Contenu Mode',
    'Créatrice de contenu Mode & Lifestyle. Collaborations avec les plus grandes marques françaises.',
    1200,
    'EUR',
    'https://instagram.com/leabeaumont',
    'https://tiktok.com/@leabeaumont',
    NULL,
    NULL,
    true,
    true
  ),
  (
    'Jade Chen',
    'Gaming',
    'Streamer Gaming Pro et créatrice de contenu. Spécialisée FPS et RPG. Communauté de 150K abonnés.',
    900,
    'EUR',
    NULL,
    'https://tiktok.com/@jadechen',
    'https://twitter.com/jadechengaming',
    'https://twitch.tv/jadechen',
    true,
    true
  ),
  (
    'Clara Rousseau',
    'Beauté',
    'Makeup Artist & Content Creator. Tutoriels beauté et reviews produits. Partenaire L''Oréal et Sephora.',
    1500,
    'EUR',
    'https://instagram.com/clararousseau',
    'https://tiktok.com/@clararousseau',
    NULL,
    'https://clararousseau.beauty',
    true,
    true
  ),
  (
    'Ines Garcia',
    'Lifestyle',
    'Créatrice Lifestyle & Voyages. 45 pays visités, partenariats avec Airbnb et Booking.com.',
    1100,
    'EUR',
    'https://instagram.com/inesgarcia',
    'https://tiktok.com/@inesgarcia',
    'https://twitter.com/inesgarcia',
    'https://inesgarcia.travel',
    true,
    false
  );

-- Insert demo reviews
INSERT INTO reviews (profile_id, client_name, rating, comment, is_verified)
SELECT p.id, r.client_name, r.rating, r.comment, r.is_verified
FROM profiles p
CROSS JOIN (
  VALUES
    ('Jean M.', 5, 'Travail exceptionnel ! Marina a capturé exactement ce que nous recherchions.', true),
    ('Alice B.', 4, 'Très professionnelle, livraison rapide. Je recommande.', true),
    ('Marc D.', 5, 'Collaboration parfaite du début à la fin.', false)
) AS r(client_name, rating, comment, is_verified)
WHERE p.name = 'Marina Dupont';

INSERT INTO reviews (profile_id, client_name, rating, comment, is_verified)
SELECT p.id, r.client_name, r.rating, r.comment, r.is_verified
FROM profiles p
CROSS JOIN (
  VALUES
    ('Pierre L.', 5, 'Sophie a réalisé un clip vidéo incroyable pour notre marque.', true),
    ('Camille R.', 5, 'Qualité cinématographique. Résultat au-delà de nos attentes.', true)
) AS r(client_name, rating, comment, is_verified)
WHERE p.name = 'Sophie Martin';

INSERT INTO reviews (profile_id, client_name, rating, comment, is_verified)
SELECT p.id, r.client_name, r.rating, r.comment, r.is_verified
FROM profiles p
CROSS JOIN (
  VALUES
    ('Emma T.', 4, 'Contenu mode de qualité, très bon sens du style.', true),
    ('Lucie P.', 5, 'Léa comprend parfaitement l''univers mode. Superbe collaboration.', true),
    ('Thomas G.', 4, 'Bon travail, délais respectés.', false),
    ('Julie H.', 5, 'Excellente créatrice, très professionnelle.', true)
) AS r(client_name, rating, comment, is_verified)
WHERE p.name = 'Léa Beaumont';

INSERT INTO reviews (profile_id, client_name, rating, comment, is_verified)
SELECT p.id, r.client_name, r.rating, r.comment, r.is_verified
FROM profiles p
CROSS JOIN (
  VALUES
    ('Maxime F.', 5, 'Stream de qualité pro. Jade est au top !', true),
    ('Sarah K.', 5, 'Communauté engagée et contenu gaming de haut niveau.', true),
    ('Romain V.', 5, 'Meilleure streameuse de la plateforme.', false)
) AS r(client_name, rating, comment, is_verified)
WHERE p.name = 'Jade Chen';

INSERT INTO reviews (profile_id, client_name, rating, comment, is_verified)
SELECT p.id, r.client_name, r.rating, r.comment, r.is_verified
FROM profiles p
CROSS JOIN (
  VALUES
    ('Marie C.', 5, 'Clara est une artiste. Ses tutoriels beauté sont inégalés.', true),
    ('Nadia S.', 4, 'Très bon contenu beauté et reviews honnêtes.', true)
) AS r(client_name, rating, comment, is_verified)
WHERE p.name = 'Clara Rousseau';

-- Insert demo bookings
INSERT INTO bookings (profile_id, client_name, client_email, project_title, project_description, status, start_date, end_date, budget, currency)
SELECT p.id, b.client_name, b.client_email, b.project_title, b.project_description, b.status::booking_status, b.start_date::DATE, b.end_date::DATE, b.budget, 'EUR'
FROM profiles p
CROSS JOIN (
  VALUES
    ('Jean M.', 'jean@example.com', 'Shooting Mode Printemps', 'Session photo pour collection printemps-été', 'completed', '2024-03-01', '2024-03-15', 3500),
    ('Alice B.', 'alice@example.com', 'Portrait Corporate', 'Portraits professionnels pour équipe de 10', 'completed', '2024-05-10', '2024-05-12', 2000),
    ('Brand X', 'contact@brandx.com', 'Campagne Instagram', 'Création de 12 posts Instagram pour lancement produit', 'in_progress', '2024-08-01', '2024-09-01', 4500)
) AS b(client_name, client_email, project_title, project_description, status, start_date, end_date, budget)
WHERE p.name = 'Marina Dupont';

INSERT INTO bookings (profile_id, client_name, client_email, project_title, project_description, status, start_date, end_date, budget, currency)
SELECT p.id, b.client_name, b.client_email, b.project_title, b.project_description, b.status::booking_status, b.start_date::DATE, b.end_date::DATE, b.budget, 'EUR'
FROM profiles p
CROSS JOIN (
  VALUES
    ('Pierre L.', 'pierre@example.com', 'Clip Musical', 'Clip vidéo pour single de lancement', 'completed', '2024-02-01', '2024-03-01', 8000),
    ('Startup Y', 'hello@startupy.com', 'Vidéo Produit', 'Vidéo de présentation produit SaaS', 'pending', '2024-09-01', '2024-09-15', 5000)
) AS b(client_name, client_email, project_title, project_description, status, start_date, end_date, budget)
WHERE p.name = 'Sophie Martin';

-- Manually recalculate performance stats for all profiles
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id FROM profiles LOOP
    PERFORM recalculate_all_stats(profile_record.id);
  END LOOP;
END $$;

-- Insert sample sync logs for demo
INSERT INTO sync_logs (profile_id, sync_type, status, duration_ms, triggered_by)
SELECT p.id, 'db_to_storage'::sync_event_type, 'success'::sync_status, 245, 'api'
FROM profiles p
WHERE p.name = 'Marina Dupont';

INSERT INTO sync_logs (profile_id, sync_type, status, duration_ms, triggered_by)
SELECT p.id, 'db_to_storage'::sync_event_type, 'success'::sync_status, 189, 'api'
FROM profiles p
WHERE p.name = 'Sophie Martin';

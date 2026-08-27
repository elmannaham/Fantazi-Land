const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://uytihmscyjpwpdhqvnbw.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGlobXNjeWpwd3BkaHF2bmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3MTk3NCwiZXhwIjoyMTAzMTQ3OTc0fQ.1d0m8r4V9EhsGls2DwFQ9LzJjetYiaJBbLQ7xkS08uc";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function main() {
  console.log("==================================================");
  console.log("🚀 SCAN SUPABASE STORAGE (SERVICE ROLE ADMIN)");
  console.log(`URL: ${supabaseUrl}`);
  console.log("==================================================");

  // 1. Lister tous les buckets
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error("Erreur listBuckets:", bErr.message);
    return;
  }

  console.log(`\n📦 BUCKETS TROUVÉS (${buckets.length}) :`);
  buckets.forEach(b => console.log(` - ${b.name} (id: ${b.id}, public: ${b.public})`));

  if (buckets.length === 0) {
    console.log("Aucun bucket trouvé dans le projet.");
    return;
  }

  // 2. Parcourir chaque bucket et extraire tous les dossiers
  const validCategories = ["Photographie", "Vidéographie", "Contenu Mode", "Beauté", "Lifestyle", "Gaming"];

  for (const bucket of buckets) {
    console.log(`\n📂 SCAN DU BUCKET: [${bucket.name}]`);
    const { data: rootItems, error: rErr } = await supabase.storage.from(bucket.name).list("", {
      limit: 100,
      sortBy: { column: "name", order: "asc" }
    });

    if (rErr) {
      console.error(`Erreur scan [${bucket.name}]:`, rErr.message);
      continue;
    }

    if (!rootItems || rootItems.length === 0) {
      console.log(` -> Aucun élément trouvé à la racine de ${bucket.name}`);
      continue;
    }

    console.log(` -> ${rootItems.length} élément(s) trouvés à la racine.`);

    for (const item of rootItems) {
      const isFile = item.name.includes(".") && !item.name.startsWith(".");
      console.log(`\n   📁 Dossier/Fichier: ${item.name} (${isFile ? "Fichier" : "Dossier"})`);

      let avatarUrl = null;
      let mediaUrls = [];

      if (!isFile) {
        // Lister l'intérieur du dossier
        const { data: subFiles } = await supabase.storage.from(bucket.name).list(item.name, { limit: 50 });
        if (subFiles && subFiles.length > 0) {
          console.log(`      ↳ Contient ${subFiles.length} fichier(s):`);
          for (const f of subFiles) {
            const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name);
            const { data: pubData } = supabase.storage.from(bucket.name).getPublicUrl(`${item.name}/${f.name}`);
            const publicUrl = pubData.publicUrl;
            console.log(`         • ${f.name} -> ${publicUrl}`);
            
            if (isImg) {
              mediaUrls.push(publicUrl);
              if (!avatarUrl) avatarUrl = publicUrl;
            }
          }
        }
      } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(item.name)) {
        const { data: pubData } = supabase.storage.from(bucket.name).getPublicUrl(item.name);
        avatarUrl = pubData.publicUrl;
        mediaUrls.push(avatarUrl);
      }

      // Décoder ou formater le nom du profil
      let cleanName = item.name.replace(/[_-]/g, " ").replace(/\.[^/.]+$/, "").trim();
      cleanName = cleanName.replace(/\b\w/g, (c) => c.toUpperCase());

      let category = "Lifestyle";
      let bio = `Créatrice Fantazi-Land (${item.name})`;
      let baseRate = 1200;

      // Si le nom contient un encodage Nom__Catégorie__Base64
      if (item.name.includes("__")) {
        const parts = item.name.split("__");
        if (parts.length >= 2) {
          cleanName = parts[0].replace(/[_-]/g, " ").trim();
          category = parts[1].replace(/[_-]/g, " ").trim();
        }
        if (parts.length >= 3) {
          try {
            const meta = JSON.parse(Buffer.from(parts[parts.length - 1], "base64").toString("utf-8"));
            if (meta.name) cleanName = meta.name;
            if (meta.category) category = meta.category;
            if (meta.bio) bio = meta.bio;
            if (meta.baseRate) baseRate = meta.baseRate;
          } catch (e) {
            // ignore
          }
        }
      }

      // Mapper la catégorie
      const catMatch = validCategories.find(c => c.toLowerCase() === category.toLowerCase());
      category = catMatch || "Photographie";

      // 3. Créer ou mettre à jour le profil en base de données
      const profilePayload = {
        name: cleanName,
        category: category,
        bio: bio,
        avatar_url: avatarUrl,
        base_rate: baseRate,
        currency: "EUR",
        is_public: true,
        is_available: true,
        storage_folder_id: item.name,
        synced_at: new Date().toISOString(),
      };

      // Tenter l'insertion
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, name")
        .or(`storage_folder_id.eq."${item.name}",name.eq."${cleanName}"`)
        .maybeSingle();

      if (existing) {
        const { error: upErr } = await supabase
          .from("profiles")
          .update(profilePayload)
          .eq("id", existing.id);

        if (upErr) {
          console.error(`      ❌ Erreur update profil ${cleanName}:`, upErr.message);
        } else {
          console.log(`      ✅ Profil mis à jour: "${cleanName}" (ID: ${existing.id})`);
        }
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("profiles")
          .insert(profilePayload)
          .select()
          .single();

        if (insErr) {
          console.error(`      ❌ Erreur création profil ${cleanName}:`, insErr.message);
        } else {
          console.log(`      🎉 Nouveau profil créé: "${inserted.name}" [${inserted.category}] (ID: ${inserted.id})`);
        }
      }
    }
  }

  // 4. Afficher tous les profils finaux
  const { data: finalProfiles, error: fErr } = await supabase
    .from("profiles")
    .select("id, name, category, avatar_url, base_rate, currency, is_public, is_available, storage_folder_id, created_at")
    .order("created_at", { ascending: false });

  console.log("\n==================================================");
  console.log(`✨ TOTAL DES PROFILS DANS FANTAZI-LAND : ${finalProfiles?.length || 0}`);
  console.log("==================================================");

  (finalProfiles || []).forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name} | Catégorie: ${p.category} | Tarif: ${p.base_rate || 0} ${p.currency} | Avatar: ${p.avatar_url ? "📸" : "❌"} | Dossier: ${p.storage_folder_id}`);
  });
}

main().catch(console.error);

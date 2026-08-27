const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

const supabaseUrl = "https://uytihmscyjpwpdhqvnbw.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGlobXNjeWpwd3BkaHF2bmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3MTk3NCwiZXhwIjoyMTAzMTQ3OTc0fQ.1d0m8r4V9EhsGls2DwFQ9LzJjetYiaJBbLQ7xkS08uc";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function generateAllProfiles() {
  console.log("==================================================");
  console.log("🚀 SCAN GLOBAL & GÉNÉRATION DES PROFILS CRÉATRICES");
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log("==================================================");

  const bucketName = "HOTESS";
  const { data: rootItems, error: fErr } = await supabase.storage.from(bucketName).list("", {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (fErr) {
    console.error("Erreur listage dossiers:", fErr.message);
    return;
  }

  // Collecter les dossiers
  const creatorsMap = new Map();
  (rootItems || []).forEach((item) => {
    if (!item.name.startsWith(".") && (!item.id || !item.name.includes("."))) {
      const lower = item.name.toLowerCase();
      if (!creatorsMap.has(lower)) {
        creatorsMap.set(lower, new Set());
      }
      creatorsMap.get(lower).add(item.name);
      creatorsMap.get(lower).add(item.name.toUpperCase());
      creatorsMap.get(lower).add(item.name.toLowerCase());
    }
  });

  const generatedProfiles = [];

  for (const [creatorKey, folderVarsSet] of creatorsMap.entries()) {
    const variations = Array.from(folderVarsSet);
    console.log(`\n--------------------------------------------------`);
    console.log(`📦 Traitement de la créatrice : [${creatorKey.toUpperCase()}]`);

    // 1. Chercher la description JSON/TXT
    let descripData = {};
    const descripFiles = ["descrip.json", "descrip.JSON", "descrip.txt", "descrip.TXT", "info.json"];

    for (const fVar of variations) {
      for (const df of descripFiles) {
        const { data: dBlob } = await supabase.storage.from(bucketName).download(`${fVar}/${df}`).catch(() => ({ data: null }));
        if (dBlob) {
          try {
            const raw = await dBlob.text();
            const sanitized = raw.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
            descripData = JSON.parse(sanitized);
            console.log(`   📄 Description trouvée dans ${fVar}/${df}`);
            break;
          } catch (e) {
            // ignore
          }
        }
      }
      if (Object.keys(descripData).length > 0) break;
    }

    // 2. Chercher l'Avatar (insensible à la casse de nom et d'extension)
    let avatarUrl = null;
    for (const fVar of variations) {
      const { data: folderFiles } = await supabase.storage.from(bucketName).list(fVar, { limit: 50 }).catch(() => ({ data: [] }));
      for (const f of (folderFiles || [])) {
        if (/^avatar\.(jpg|jpeg|png|webp)$/i.test(f.name)) {
          avatarUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fVar}/${f.name}`;
          console.log(`   📸 Avatar validé : ${fVar}/${f.name}`);
          break;
        }
      }
      if (avatarUrl) break;
    }

    // 3. Chercher les photos de galerie
    const galleryUrls = [];
    const imageFolders = ["images", "Images", "IMAGES", "photos", "Photos", ""];

    // Lister tous les fichiers potentiels
    const candidateFiles = new Set();
    for (const fVar of variations) {
      for (const sub of imageFolders) {
        const prefix = sub ? `${fVar}/${sub}` : fVar;
        const { data: files } = await supabase.storage.from(bucketName).list(prefix, { limit: 50 }).catch(() => ({ data: [] }));
        (files || []).forEach((f) => {
          if (/\.(jpg|jpeg|png|webp|gif)$/i.test(f.name) && !/^avatar\./i.test(f.name)) {
            candidateFiles.add(f.name);
          }
        });
      }
    }

    // Tester chaque fichier dans toutes les combinaisons de chemin
    for (const fileName of candidateFiles) {
      let foundPath = null;
      for (const fVar of variations) {
        for (const sub of imageFolders) {
          const testPath = sub ? `${fVar}/${sub}/${fileName}` : `${fVar}/${fileName}`;
          const { data: testBlob } = await supabase.storage.from(bucketName).download(testPath).catch(() => ({ data: null }));
          if (testBlob && testBlob.size > 0) {
            foundPath = testPath;
            break;
          }
        }
        if (foundPath) break;
      }

      if (foundPath) {
        const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${foundPath}`;
        if (!galleryUrls.includes(fullUrl)) {
          galleryUrls.push(fullUrl);
          console.log(`   🖼️ Photo validée : ${foundPath}`);
        }
      }
    }

    // Si aucun Avatar.jpg dédié, utiliser la première photo du portfolio comme avatar
    if (!avatarUrl && galleryUrls.length > 0) {
      avatarUrl = galleryUrls[0];
      console.log(`   📸 Avatar déduit de la 1ère photo du portfolio : ${avatarUrl}`);
    }

    // Construire les données du profil
    let rawName = descripData.nom || descripData.name || "";
    let displayName = (rawName.trim().length > 1) ? rawName : creatorKey.toUpperCase();
    displayName = displayName.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

    const email = `${creatorKey.replace(/[^a-z0-9]/g, "")}@fantazi-land.com`;
    const category = descripData.categorie || descripData.category || "Photographie";
    const bio = descripData.bio || `Créatrice exclusive Fantazi-Land (${displayName})`;
    const baseRate = descripData.base_rate || descripData.baseRate || 500;
    const currency = descripData.currency || "CAD";
    const telegramUrl = descripData.TELEGRAM || descripData.telegram || null;
    const instagramUrl = descripData.instagram || descripData.TELEGRAM || null;

    const profileMetadata = {
      name: displayName,
      display_name: displayName,
      category,
      bio,
      avatar_url: avatarUrl,
      gallery: galleryUrls,
      base_rate: baseRate,
      currency,
      telegram_url: telegramUrl,
      instagram_url: instagramUrl,
      is_public: true,
      is_available: true,
      storage_folder: creatorKey,
      bucket: bucketName,
      updated_at: new Date().toISOString(),
    };

    // 4. Mettre à jour / Créer l'utilisateur dans Supabase Auth
    let userId = null;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = (existingUsers?.users || []).find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: profileMetadata,
      });
      console.log(`   👤 Auth user synchronisé : ${email} (ID: ${userId})`);
    } else {
      const { data: newUser, error: createAuthErr } = await supabase.auth.admin.createUser({
        email,
        password: `Fantazi2026!_${creatorKey}`,
        email_confirm: true,
        user_metadata: profileMetadata,
      });

      if (createAuthErr) {
        console.error(`   ❌ Erreur création auth user:`, createAuthErr.message);
        continue;
      }
      userId = newUser.user.id;
      console.log(`   ✨ Nouvel auth user créé : ${email} (ID: ${userId})`);
    }

    // 5. Mettre à jour la table profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);
    } else {
      await supabase.from("profiles").insert({ id: userId, display_name: displayName });
    }

    generatedProfiles.push({
      id: userId,
      name: displayName,
      email,
      category,
      bio,
      baseRate: `${baseRate} ${currency}`,
      avatar: avatarUrl,
      galleryCount: galleryUrls.length,
      gallery: galleryUrls,
    });
  }

  // 6. Sauvegarder dans data/creators-catalog.json
  const catalogPath = path.join(__dirname, "../data/creators-catalog.json");
  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  fs.writeFileSync(catalogPath, JSON.stringify(generatedProfiles, null, 2), "utf-8");

  console.log("\n==================================================");
  console.log(`🎉 GÉNÉRATION TERMINÉE : ${generatedProfiles.length} PROFILS SYNCHRONISÉS`);
  console.log("==================================================");
  generatedProfiles.forEach((p, idx) => {
    console.log(`\n${idx + 1}. 🌟 ${p.name.toUpperCase()} [${p.category}] - ${p.baseRate}`);
    console.log(`   • Avatar : ${p.avatar}`);
    console.log(`   • Galerie (${p.galleryCount} photos) :`);
    p.gallery.forEach((g) => console.log(`     - ${g}`));
  });
}

generateAllProfiles().catch(console.error);

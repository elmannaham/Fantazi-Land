const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = "https://uytihmscyjpwpdhqvnbw.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGlobXNjeWpwd3BkaHF2bmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3MTk3NCwiZXhwIjoyMTAzMTQ3OTc0fQ.1d0m8r4V9EhsGls2DwFQ9LzJjetYiaJBbLQ7xkS08uc";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function safeParseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    try {
      const cleaned = jsonString.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

async function main() {
  console.log("==================================================");
  console.log("🚀 SYNCHRONISATION OPTIMISÉE DU BUCKET SUPABASE");
  console.log(`URL: ${supabaseUrl}`);
  console.log("==================================================");

  const bucketName = "HOTESS";
  const { data: rootItems, error: rErr } = await supabase.storage.from(bucketName).list("", {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (rErr) {
    console.error(`Erreur scan [${bucketName}]:`, rErr.message);
    return;
  }

  const folderItems = (rootItems || []).filter((i) => !i.name.includes(".") && !i.name.startsWith("."));
  console.log(`📂 Dossiers d'hôtesses trouvés : ${folderItems.length}`);

  const catalog = [];

  for (const folder of folderItems) {
    const folderName = folder.name;
    console.log(`\n📁 Traitement: ${folderName}`);

    const { data: subFiles } = await supabase.storage.from(bucketName).list(folderName, { limit: 50 });

    let avatarUrl = "";
    let metadataObj = {};
    const seenFilenames = new Set();
    const gallery = [];

    for (const file of subFiles || []) {
      const fLower = file.name.toLowerCase();
      if (fLower.startsWith("avatar") && /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(`${folderName}/${file.name}`);
        avatarUrl = data.publicUrl;
      }

      if (fLower.includes("descrip") && /\.(json|txt)$/i.test(file.name)) {
        try {
          const { data: blob } = await supabase.storage.from(bucketName).download(`${folderName}/${file.name}`);
          if (blob) {
            const text = await blob.text();
            const parsed = safeParseJson(text);
            if (parsed) metadataObj = { ...metadataObj, ...parsed };
          }
        } catch (e) {
          // ignore
        }
      }
    }

    // Scanner les sous-dossiers
    const { data: subDirItems } = await supabase.storage.from(bucketName).list(`${folderName}`, { limit: 50 });
    const subDirs = (subDirItems || [])
      .filter((i) => !i.name.includes(".") && !i.name.startsWith("."))
      .map((d) => d.name);

    const checkDirs = subDirs.length > 0 ? subDirs : ["images"];

    for (const dir of checkDirs) {
      const { data: imgFiles } = await supabase.storage.from(bucketName).list(`${folderName}/${dir}`, { limit: 100 });
      if (imgFiles && imgFiles.length > 0) {
        for (const img of imgFiles) {
          if (/\.(jpg|jpeg|png|webp|gif|mp4)$/i.test(img.name)) {
            const lowerName = img.name.toLowerCase();
            if (!seenFilenames.has(lowerName)) {
              seenFilenames.add(lowerName);
              const { data } = supabase.storage.from(bucketName).getPublicUrl(`${folderName}/${dir}/${img.name}`);
              gallery.push(data.publicUrl);
            }
          }
        }
      }
    }

    const cleanName =
      folderName.length > 2
        ? folderName.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : metadataObj.nom || metadataObj.name || folderName;

    const category = metadataObj.categorie || metadataObj.category || "Photographie";
    const bio =
      metadataObj.bio ||
      `Hôtesse d'exception professionnelle (${cleanName}) synchronisée depuis le stockage.`;
    const baseRate = `${metadataObj.base_rate || 500} ${metadataObj.currency || "CAD"}`;

    const profileData = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@fantazi-land.com`,
      category: category,
      bio: bio,
      baseRate: baseRate,
      avatar: avatarUrl || gallery[0] || "",
      galleryCount: gallery.length,
      gallery: gallery,
    };

    catalog.push(profileData);
    console.log(`   ✅ Profil ${cleanName} - ${gallery.length} photos uniques trouvées`);
  }

  // Écrire le fichier catalog local
  const catalogPath = path.join(__dirname, "..", "data", "creators-catalog.json");
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
  console.log(`\n🎉 Synchronisation terminée ! ${catalog.length} profils enregistrés dans creators-catalog.json`);
}

main().catch(console.error);

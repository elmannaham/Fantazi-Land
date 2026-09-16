export interface BioData {
  name: string;
  category: string;
  baseRate?: number | null;
  currency?: string;
  avgRating?: number;
  totalProjects?: number;
}

export function generatePersonalizedBio(data: BioData): string {
  const { name, category, baseRate, currency = "EUR", avgRating = 5.0, totalProjects = 0 } = data;

  const intros = [
    `Découvrez ${name}, une experte passionnée dans l'univers de la ${category.toLowerCase()}.`,
    `Bienvenue dans l'univers de ${name}, spécialiste reconnue en ${category.toLowerCase()}.`,
    `${name} incarne l'excellence et l'élégance dans le domaine de la ${category.toLowerCase()}.`,
  ];

  const valueProps = [
    `Avec une attention méticuleuse aux détails et un professionnalisme exemplaire, ${name} s'engage à sublimer chacun de vos projets.`,
    `Forte d'une expérience solide, ${name} apporte une touche unique et créative à toutes ses collaborations.`,
    `Réputée pour son sérieux et sa polyvalence, ${name} est le choix idéal pour vos besoins en ${category.toLowerCase()}.`,
  ];

  const socialProof = totalProjects > 0
    ? `Ayant déjà brillamment complété ${totalProjects} projets sur notre plateforme avec une note moyenne exceptionnelle de ${avgRating.toFixed(1)}/5, ${name} fait partie de nos talents les plus sollicités.`
    : `Nouvellement arrivée sur notre plateforme, ${name} affiche déjà un potentiel remarquable et une volonté de fer pour marquer votre prochain événement.`;

  const closing = baseRate
    ? `Disponible à partir de ${baseRate}${currency} par heure, ${name} est prête à donner vie à votre vision. N'attendez plus pour réserver ses services exclusifs.`
    : `${name} est disponible pour vos futurs projets. Contactez-nous dès aujourd'hui pour planifier votre séance et découvrir son talent en direct.`;

  // Random selection for variety
  const intro = intros[Math.floor(Math.random() * intros.length)];
  const value = valueProps[Math.floor(Math.random() * valueProps.length)];

  return `${intro}\n\n${value}\n\n${socialProof}\n\n${closing}`;
}

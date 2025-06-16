export const motivationalQuotes = [
  "🏃‍♂️ Cada passo te leva mais perto do seu objetivo!",
  "💪 O único treino ruim é aquele que você não fez.",
  "🌟 Você é mais forte do que suas desculpas.",
  "🎯 Foque no progresso, não na perfeição.",
  "🔥 A dor é temporária, a satisfação é para sempre.",
  "⚡ Seus limites são apenas a sua mente.",
  "🚀 Comece devagar, mas não pare jamais.",
  "💎 Grandes resultados exigem grandes esforços.",
  "🌅 Cada manhã é uma nova oportunidade de ser melhor.",
  "🏆 Champions são feitos quando ninguém está olhando.",
  "💫 Acredite em você e todo o resto se encaixa.",
  "🎪 A jornada de mil quilômetros começa com um passo.",
  "⭐ Você não precisa ser perfeito, apenas constante.",
  "🌈 Após a tempestade, sempre vem o arco-íris.",
  "🔋 Energia que você não usa hoje, você perde para sempre.",
  "🌊 Seja como a água: persistente e imparável.",
  "🎨 Pinte sua vida com cores vibrantes através do esporte.",
  "🌸 Floresça onde você foi plantado, mesmo que seja difícil.",
  "🎵 Encontre seu ritmo e dance com a vida.",
  "🌟 Cada pequeno progresso merece ser celebrado.",
  "🏔️ As montanhas não se movem por si, mas você pode escalá-las.",
  "🔥 Transforme sua paixão em propósito.",
  "💝 O melhor investimento é em você mesmo.",
  "🌍 Seja a mudança que você quer ver no mundo.",
  "⚡ A velocidade não importa tanto quanto a direção.",
  "🎯 Mire na lua, mesmo se errar cairá entre as estrelas.",
  "🌟 Sua única competição é quem você foi ontem.",
  "🦋 Metamorfose acontece fora da zona de conforto.",
  "🌺 Cultive paciência, os resultados estão crescendo.",
  "🎊 Celebre cada vitória, por menor que seja.",
];

export const getTodaysQuote = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
};

export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}; 
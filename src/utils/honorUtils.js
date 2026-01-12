export const getHonorColor = (score = 100) => {
    if (score >= 900) return "from-yellow-400 to-amber-600"; // Legendary (Gold)
    if (score >= 700) return "from-purple-500 to-pink-600";   // Master (Purple)
    if (score >= 500) return "from-red-500 to-orange-600";    // Expert (Red/Orange)
    if (score >= 300) return "from-green-400 to-emerald-600"; // Skilled (Green)
    if (score >= 100) return "from-blue-400 to-cyan-500";     // Standard (Blue)
    return "from-slate-500 to-gray-600";                      // Beginner (Gray)
};

export const getHonorText = (score = 100) => {
    if (score >= 900) return "text-amber-400";
    if (score >= 700) return "text-purple-400";
    if (score >= 500) return "text-orange-400";
    if (score >= 300) return "text-green-400";
    if (score >= 100) return "text-blue-400";
    return "text-slate-400";
};

export const getHonorBorder = (score = 100) => {
    if (score >= 900) return "border-amber-500/50";
    if (score >= 700) return "border-purple-500/50";
    if (score >= 500) return "border-orange-500/50";
    if (score >= 300) return "border-green-500/50";
    if (score >= 100) return "border-blue-500/50";
    return "border-slate-500/50";
};

export const getHonorLabel = (score = 100) => {
    if (score >= 900) return "Legend";
    if (score >= 700) return "Master";
    if (score >= 500) return "Expert";
    if (score >= 300) return "Skilled";
    if (score >= 100) return "Member";
    return "Rookie";
};

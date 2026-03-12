export const LANGUAGES = {
    java: { monaco: "java", defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}` },
    cpp: { monaco: "cpp", defaultCode: `#include <iostream>\nint main() {\n  std::cout << "Hello\\n";\n  return 0;\n}` }
};

export const ROUND_CONFIG = [
    { round: 1, difficulty: "EASY", time: "20 min", eliminate: "20%" },
    { round: 2, difficulty: "EASY", time: "18 min", eliminate: "25%" },
    { round: 3, difficulty: "MEDIUM", time: "15 min", eliminate: "33%" },
    { round: 4, difficulty: "HARD", time: "12 min", eliminate: "50%" },
    { round: 5, difficulty: "HARD", time: "10 min", eliminate: "All but Winner" },
];

export const SOCKET_URL = import.meta.env.VITE_API_URL || "http://56.228.2.167:4000";

import next from "eslint-config-next";

const config = [...next, { ignores: [".next/**", "src/**/*.types.ts"] }];

export default config;

import cors from "cors";
const setting = {
  origin: process.env.CORS_ORIGIN,
  credential: true,
};
const corsSetting = cors(setting);
export { corsSetting };

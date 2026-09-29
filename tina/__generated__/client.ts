import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: "/home/user/lummi-bay-market-website/tina/__generated__/.cache/1790702177102", url: "http://localhost:4001/graphql", token: "null", queries,  });
export default client;
  
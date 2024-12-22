import fs from "fs";
import path from "path";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSkins(
  apiUrl: string,
  cursor: string | null = null
): Promise<any> {
  try {
    console.log("Waiting 5 seconds before fetching");
    await delay(5000);

    const url = cursor ? `${apiUrl}?cursor=${cursor}` : apiUrl;
    const response = await fetch(url, {
      headers: {
        Authorization: "MNKlrP29t6SX11K0KNr0gmcCkvM-O2yU",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch skin data");
    console.log("Fetched data", cursor);
    return await response.json();
  } catch (error) {
    console.error("Error fetching skins:", error);
    return null;
  }
}

async function main() {
  const apiUrl = "https://csfloat.com/api/v1/listings";
  let cursor: string | null = null;
  const skinMapping: Record<
    string,
    {
      def_index: number;
      paint_index?: number;
      sticker_index?: number;
      keychain_index?: number;
    }
  > = {};

  do {
    const skinData = await fetchSkins(apiUrl, cursor);

    if (!skinData || !skinData.data) {
      console.error("No data or error in response.");
      break;
    }

    skinData.data.forEach((item: any) => {
      const name = item.item?.name || item.item?.item_name;
      const defIndex = item.item?.def_index;
      const paintIndex = item.item?.paint_index;
      const stickerIndex = item.item?.sticker_index;
      const keychainIndex = item.item?.keychain_index;

      if (!skinMapping[name]) {
        console.log("Inserted the skin: ", name);
        skinMapping[name] = {
          def_index: defIndex,
          paint_index: paintIndex,
          sticker_index: stickerIndex,
          keychain_index: keychainIndex,
        };
      } else {
        console.log("Skin already exists: ", name);
      }
    });

    cursor = skinData.cursor || null;
  } while (cursor);

  console.log(
    "Finished mapping all skins successfuly, now in process of creating a json file with them"
  );

  const filePath = path.resolve(__dirname, "skinMapping.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(skinMapping, null, 2));
    console.log(`Skin mapping saved to ${filePath}`);
  } catch (error) {
    console.error("Error saving skin mapping to file:", error);
  }
}

main();

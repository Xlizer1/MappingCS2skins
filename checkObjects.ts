import skinsMapping from "./skinMapping.json";
import mysql, { type RowDataPacket } from "mysql2";

// Define the exact shape of the mapping
type SkinMapping = {
  [key: string]: {
    def_index?: number;
    paint_index?: number;
    sticker_index?: number;
    keychain_index?: number;
  };
};

interface Skin {
  name?: string;
  def_index?: number;
  paint_index?: number | null;
  sticker_index?: number | null;
  keychain_index?: number | null;
}

// Create MySQL connection
const connection = mysql.createConnection({
  user: "root",
  password: "",
  host: "localhost",
  database: "floatastic",
});

// Handle connection errors
connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL");
});

const obj: SkinMapping = skinsMapping;
const objectKeys = Object.keys(obj);

let pendingQueries = objectKeys.length; // Track remaining queries

objectKeys.forEach((key) => {
  const mysqlObj: Skin = {
    name: key,
    def_index: obj[key].def_index,
    paint_index: obj[key].paint_index ?? null,
    sticker_index: obj[key].sticker_index ?? null,
    keychain_index: obj[key].keychain_index ?? null,
  };

  const selectQuery = `SELECT name FROM skins WHERE name = ?`;

  connection.query(selectQuery, [mysqlObj.name], (err, results) => {
    if (err) {
      console.error(`❌ Error querying skin: ${mysqlObj.name}`, err.message);
      return checkEnd();
    }

    // Explicitly cast results to RowDataPacket[]
    const rows = results as RowDataPacket[];

    if (rows.length > 0) {
      // console.log(`✅ The skin "${mysqlObj.name}" was found in the database.`);
      return checkEnd();
    }

    console.log(`⚠️ The skin "${mysqlObj.name}" wasn't found. Inserting...`);

    const insertQuery = `
      INSERT INTO skins (name, def_index, paint_index, sticker_index, keychain_index)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
      insertQuery,
      [
        mysqlObj.name,
        mysqlObj.def_index,
        mysqlObj.paint_index,
        mysqlObj.sticker_index,
        mysqlObj.keychain_index,
      ],
      (insertErr, result) => {
        if (insertErr) {
          console.error(
            `❌ Error inserting skin: ${mysqlObj.name}`,
            insertErr.message
          );
        } else {
          // console.log(`✅ Inserted skin "${mysqlObj.name}" successfully.`);
        }
        checkEnd();
      }
    );
  });
});

// Close the connection when all queries are done
function checkEnd() {
  pendingQueries--;
  if (pendingQueries === 0) {
    console.log("✅ All queries completed. Closing MySQL connection.");
    connection.end((err) => {
      if (err) {
        console.error("❌ Error closing MySQL connection:", err.message);
      } else {
        console.log("✅ MySQL connection closed.");
      }
    });
  }
}

import skinsMapping from "./skinMapping.json";
import mysql from "mysql2";

let connection;

connection = mysql.createConnection({
  user: "root",
  password: "",
  host: "localhost",
  database: "floatastic",
});

// Define the exact shape of the mapping
type SkinMapping = {
  [key: string]: {
    def_index?: number;
    paint_index?: number;
    sticker_index?: number;
    keychain_index?: number;
  };
};

interface skin {
  name?: string;
  def_index?: number;
  paint_index?: number;
  sticker_index?: number;
  keychain_index?: number;
}

const obj: SkinMapping = skinsMapping;

const objectKeys = Object.keys(obj);

for (let key of objectKeys) {
  const mysqlObj: skin = {
    name: key,
    def_index: obj[key].def_index,
    paint_index: obj[key].paint_index,
    sticker_index: obj[key].sticker_index,
    keychain_index: obj[key].keychain_index
  };
  let sql = `
        INSERT INTO
            skins (
                name,
                def_index,
                paint_index,
                sticker_index,
                keychain_index
            )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?
        )
        
    `;

  connection.query(
    sql,
    [
      mysqlObj.name,
      mysqlObj.def_index,
      mysqlObj.paint_index ? mysqlObj.paint_index : "NULL",
      mysqlObj.sticker_index ? mysqlObj.sticker_index : "NULL",
      mysqlObj.keychain_index ? mysqlObj.keychain_index : "NULL",
    ],
    (callBack) => {
        console.log(callBack)
    }
  );
}

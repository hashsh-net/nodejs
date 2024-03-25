import { firestore } from "../lib/firebase.js"

const baseData = 
{ "success": true, "data": { "name": [ "吾川郡吾川村", "吾川郡池川町", "吾川郡いの町", "吾川郡伊野町", "吾川郡吾北村", "吾川郡仁淀川町", "吾川郡春野町", "安芸郡馬路村", "安芸郡北川村", "安芸郡芸西村", "安芸郡田野町", "安芸郡東洋町", "安芸郡奈半利町", "安芸郡安田町", "安芸市", "香美郡赤岡町", "香美郡香我美町", "香美郡香北町", "香美郡土佐山田町", "香美郡野市町", "香美郡物部村", "香美郡夜須町", "香美郡吉川村", "香美市", "高知市", "香南市", "四万十市", "宿毛市", "須崎市", "高岡郡大野見村", "高岡郡越知町", "高岡郡窪川町", "高岡郡佐川町", "高岡郡四万十町", "高岡郡津野町", "高岡郡中土佐町", "高岡郡仁淀村", "高岡郡葉山村", "高岡郡東津野村", "高岡郡日高村", "高岡郡檮原町", "土佐郡大川村", "土佐郡鏡村", "土佐郡土佐町", "土佐郡土佐山村", "土佐郡本川村", "土佐市", "土佐清水市", "中村市", "長岡郡大豊町", "長岡郡本山町", "南国市", "幡多郡大方町", "幡多郡大月町", "幡多郡黒潮町", "幡多郡佐賀町", "幡多郡大正町", "幡多郡十和村", "幡多郡西土佐村", "幡多郡三原村", "室戸市" ], "nameKana": [ "アガワグンアガワムラ", "アガワグンイケガワチョウ", "アガワグンイノチョウ", "アガワグンイノチョウ", "アガワグンゴホクソン", "アガワグンニヨドガワチョウ", "アガワグンハルノチョウ", "アキグンウマジムラ", "アキグンキタガワムラ", "アキグンゲイセイムラ", "アキグンタノチョウ", "アキグントウヨウチョウ", "アキグンナハリチョウ", "アキグンヤスダチョウ", "アキシ", "カミグンアカオカチョウ", "カミグンカガミチョウ", "カミグンカホクチョウ", "カミグントサヤマダチョウ", "カミグンノイチチョウ", "カミグンモノベソン", "カミグンヤスチョウ", "カミグンヨシカワムラ", "カミシ", "コウチシ", "コウナンシ", "シマントシ", "スクモシ", "スサキシ", "タカオカグンオオノミソン", "タカオカグンオチチョウ", "タカオカグンクボカワチョウ", "タカオカグンサカワチョウ", "タカオカグンシマントチョウ", "タカオカグンツノチョウ", "タカオカグンナカトサチョウ", "タカオカグンニヨドムラ", "タカオカグンハヤマムラ", "タカオカグンヒガシツノムラ", "タカオカグンヒダカムラ", "タカオカグンユスハラチョウ", "トサグンオオカワムラ", "トサグンカガミムラ", "トサグントサチョウ", "トサグントサヤマムラ", "トサグンホンガワムラ", "トサシ", "トサシミズシ", "ナカムラシ", "ナガオカグンオオトヨチョウ", "ナガオカグンモトヤマチョウ", "ナンコクシ", "ハタグンオオガタチョウ", "ハタグンオオツキチョウ", "ハタグンクロシオチョウ", "ハタグンサガチョウ", "ハタグンタイショウチョウ", "ハタグントオワソン", "ハタグンニシトサムラ", "ハタグンミハラムラ", "ムロトシ" ], "url": "https://www.post.japanpost.jp/cgi-zip/zipcode.php?pref=39" } }

const names = baseData.data.name
const nameKanas = baseData.data.nameKana

const prefectureId = 'kouchi'
const prefectureName = '高知'
const region = '四国'

const areaData = names.map((name, index) => ({
  prefectureId: prefectureId,
  name: name,
  nameKana: nameKanas[index],
  areaId: `${prefectureId}-${index + 1}`
}))

for(const area of areaData){
  const areaRef = firestore.doc(firestore.db, "mstArea", area.areaId)
  await firestore.setDoc(areaRef, area ,{ merge: true })
}


const prefecture = {
  name: prefectureName,
  prefectureId: prefectureId,
  region: region,
}
const prefectureRef = firestore.doc(firestore.db, "mstPrefecture", prefectureId)
await firestore.setDoc(prefectureRef, prefecture ,{ merge: true })


// const deleteAreaDocs = async (prefectureId) => {
//   const q = firestore.query(firestore.collection(firestore.db, "mstArea"), firestore.where("prefectureId", "==", prefectureId));
//   const querySnapshot = await firestore.getDocs(q);
//   querySnapshot.forEach(async (doc) => {
//     await firestore.deleteDoc(doc.ref);
//     console.log(`Document with ID ${doc.id} successfully deleted`);
//   });
// };

// // mstArea ドキュメントを削除する関数を呼び出す
// await deleteAreaDocs("gunma")

console.log('end:'+prefectureId)
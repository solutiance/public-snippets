//script to crawl customer file storage

const host = location.protocol + '//' + location.hostname ;
const path = `/${location.pathname.split('/')[1]}/`;
const referrer = host + path + 'index.html';

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

const preparePDFLib = () => {
  // Load pdf-lib
  const pdfLibScript = document.createElement('script');
  pdfLibScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
  document.head.appendChild(pdfLibScript);
  //can now be accessed like const { PDFDocument } = window.pdfLib;))
}
const fetchPDF = async (url) => {
    const response = await fetch(url,{
        "headers": {
          "accept": "*/*",
          "accept-language": "de-DE,de;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      });
    const blob = await response.blob();
    return blob;
  };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const handleNetworkError = (response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text(); // Get the response as text
  };
  const parseResponse = (text) =>  {
    // Use eval to convert the response text to a JavaScript object
    const jsonObject = eval(`(${text})`);
    return jsonObject;
  }
const setCurrentEQID = (equipmentID) => {
   return fetch(`${host}${path}eqdetail?_dc=${Date.now()}&OnInputProcessing=setCurrentEQ&equnr=${equipmentID}`, {
  "headers": {
    "accept": "*/*",
    "accept-language": "de-DE,de;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": referrer,
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
};
const fetchTermineForCurrentEQ = () => {
    return fetch(`${host}${path}eqdetail?_dc=${Date.now()}&OnInputProcessing=getTermine&page=1&start=0&limit=5000`, {
  "headers": {
    "accept": "*/*",
    "accept-language": "de-DE,de;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": referrer,
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
}
const doEquipmentListFetch = () => {
    return fetch(`${host}${path}eqlist?_dc=${Date.now()}&getAll=true&iv_eqo_contract=true&OnInputProcessing=getEquipments&page=1&start=0&limit=5000`, {
        "headers": {
          "accept": "*/*",
          "accept-language": "de-DE,de;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": referrer,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      })
}

const fetchDocsForZtsbln = (ztsbln) => {
   return  fetch(`${host}${path}eqdetail?_dc=${Date.now()}&OnInputProcessing=getDocumentList&ztsbln=${ztsbln.replace(/^0+/, '')}`, {
  "headers": {
    "accept": "*/*",
    "accept-language": "de-DE,de;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": referrer,
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
}).then(handleNetworkError).then(parseResponse);
}

const downloadMergedPDF = async (name, links) =>  {
    const pdfBlobs = await Promise.all(links.map(url => fetchPDF(url)));
    const { PDFDocument } = window.PDFLib;

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      for (const pdfBlob of pdfBlobs) {
        const pdfData = await pdfBlob.arrayBuffer();
        const pdf = await PDFDocument.load(pdfData);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }


       // Serialize the merged PDF to bytes (a Uint8Array)
    const mergedPdfBytes = await mergedPdf.save();

        // Create a blob from the bytes
        const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

        // Create a link element and download the merged PDF
        const link = document.createElement('a');
        link.href = URL.createObjectURL(mergedPdfBlob);
        link.download = `${name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
}
const getEquipmentList = async () => {
return await doEquipmentListFetch()
.then(handleNetworkError)
.then(parseResponse);
}

const getTermineForCurrentEQ = async () => {
    return await fetchTermineForCurrentEQ()
    .then(handleNetworkError)
    .then(parseResponse);
    }

const download = async (street,zip,city) => {
    let i = 0;
    const result = [];
    const el = await getEquipmentList();
    const elems = el.items
    .filter(i => i.sto_ort === city)
    .filter(i => i.sto_plz === zip)
    .filter(i => i.sto_str === street);
    for (let elem of elems) {
        let elementID = elem.equnr?.replace(/^0+/, '')
        await setCurrentEQID(elementID);
        await sleep(100);
        const termine = await getTermineForCurrentEQ();
        const termineWithDoc = termine.filter(t => t.pruefbericht === "X").filter(t => !!t.ztsbln);
        // console.log('termineWithDoc', termineWithDoc)
        for(let termin of termineWithDoc){
            const docs = await fetchDocsForZtsbln(termin.ztsbln)
            // console.log('docs', docs);
            const docLinks = docs
            .filter(doc => !!doc.name)
            .filter(doc => !!doc.archiv_id)
            .map(doc => `${host}${path}documents?OnInputProcessing=getPbDocument&Object_id=${doc.archiv_id}`);

            // console.log('docLinks', docLinks);
            result.push(docLinks);
            sleep(50);
            downloadMergedPDF(`${elem.eartx}(${elementID})_${termin.ztspridt}_${termin.pruefdatum}_${termin.ztsbln}`,docLinks);
            sleep(50);
        }
    }
    console.log(`Download von ${result.length} Dateien für ${street} ${zip} ${city} fertiggestellt!`)
    return result;
};
window['download'] = download;
preparePDFLib();
console.log('Scan läuft. Bitte warten....')
sleep(100);
getEquipmentList().then(el => {
    console.log('#############################################################################################');
    console.log('Daten für folgende Standorte gefunden. Herunterladen durch ausführen der einzelnen Zeilen:');
    console.log('');
    el.items.map(i => `await download('${i.sto_str}','${i.sto_plz}','${i.sto_ort}')`).filter(onlyUnique).forEach(l => console.log(l));
    console.log('');
    console.log('!!!! WICHTIG: einzeln ausführen und Dateien nach abschluss jedes Befehls verschieben. !!!');
    console.log('#############################################################################################'); 
})


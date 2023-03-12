import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import {AiOutlineCloudDownload} from 'react-icons/ai';
import { fabric } from 'fabric';
import axios from "axios";

export default function UploadPDFModal({pdfModalOpen, setpdfModalOpen, onUpload,activeCanvas, readPdf, setReadPdf}) {
  const [isOpen, setIsOpen] = useState(true);
  const [totalPages, setTotalPages] = useState(null);
  const [fileType, setFileType] = useState("");
  const [pagesToInsert, setPagesToInsert] = useState('');
  const [loadedImg, setLoadedImg] = useState();

  async function downloadFile(){
    try{
      let response = await axios({
        url: url, //your url
        method: 'GET',
        responseType: 'blob', // important
        withCredentials: false,

    });
    const imageLoad = await imageToBase64(response.data);
    setFileType("img");
    setLoadedImg(imageLoad);
    }catch(err){
      const pdf = await window.pdfjs.getDocument(url).promise;
      console.log(pdf);
      const pages = await pdf.numPages
      setTotalPages(pages);
      setReadPdf(pdf);
    }
    


  // console.log(response.data);
  // let type = response?.data?.type?.split("/")[0];
  // console.log(type)
  // if(type !== "image"){

  // }else{

  // }


  }

  const [url, seturl] = useState('');

  function closeModal() {
    setpdfModalOpen(false);
    renderPDFWithNum();
  }

  async function pdfUploadHandle(e){

    const file = e.target.files[0];
    let fileExtension = file.name.split('.');
    fileExtension = fileExtension[fileExtension.length -1];
    if(fileExtension !== 'pdf'){
        const imageLoad = await imageToBase64(file);
        setFileType("img");
        setLoadedImg(imageLoad);
    }else{
      setFileType("pdf");
      const data = await readFileSync(file);
      const pdf = await window.pdfjs.getDocument({data}).promise;
      const pages = await pdf.numPages
      setTotalPages(pages);
      setReadPdf(pdf);
    }
  }

  async function renderPDFWithNum(){
    if(fileType === "pdf"){
      let pagesT = pagesToInsert.split(',');
      console.log(pagesT);
      pagesT.forEach(async(p, idx)=> {
        const page = await readPdf.getPage(Number(p));
        const viewport = page.getViewport({scale: 1});
        const Dcanvas = document.createElement('canvas');
        const canvasContext = Dcanvas.getContext('2d');
        Dcanvas.height = viewport.height;
        Dcanvas.width = viewport.width;
        await page.render({canvasContext, viewport}).promise;
          // Get the image object and move it to the background layer
          const pdfImage = new fabric.Image(Dcanvas, { left: 0, top: 0});
          activeCanvas.add(pdfImage);
          activeCanvas.renderAll();
          if(idx === (pagesT.length - 1)){
            setReadPdf(null);
          }
      })  
    }else{
      if(loadedImg){
        fabric.Image.fromURL(loadedImg,function(img){
          img.set('left',window.innerWidth/3).set('top',window.innerHeight/3)
          activeCanvas.add(img);
          activeCanvas.requestRenderAll();
          activeCanvas.selectable = false;
          setLoadedImg(null);
        });
      }

    }
  

  }


  return (
    <>

      <Transition appear show={pdfModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[10000000]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[400px] h-[275px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-3xl font-medium leading-6 text-gray-900"
                  >
                    Upload PDF
                  </Dialog.Title>
                  <div className="mt-2 grid gap-2">
                    <div className='flex flex-col p-1'>
                        <p className='text-2xl'>Enter URL</p>
                        <div className='flex flex-row'>
                          <input type="text" className='border-[1px] p-1 rounded-md border-gray-200 h-11 w-[33.5rem] outline-none' value={url} onChange={e=> seturl(e.target.value)} />
                          <button className='ml-2' onClick={()=> downloadFile()}><AiOutlineCloudDownload size="2em" /></button>
                        </div>

                    </div>
                    <div className='flex flex-col p-1'>
                        <p className='text-2xl'>From Your device</p>
                        <input type="file" onChange={(e)=> pdfUploadHandle(e)} />
                    </div>
                    <div className='flex flex-row justify-between p-1'>
                        <p className='text-2xl'> Total Pages</p>
                        <p className='text-xl'>{totalPages}</p>
                    </div>
                    <div className='flex flex-row justify-between p-1'>
                        <p className='text-2xl'>Pages You want to Insert</p>
                        <input type="text" className='border-[1px] p-1 rounded-md border-gray-200 h-11 w-[25rem] outline-none' value={pagesToInsert} onChange={e=> setPagesToInsert(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-row justify-end p-1">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-lg font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Insert
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}


const readFileSync = (file) => {
    return new Promise((res,rej) => {
        let reader = new FileReader();
        reader.onload = e => {
                const data = atob(e.target.result.replace(/.*base64,/,''));
                res(data);
        }
        reader.onerror = err => {
            rej(err);
        }
        reader.readAsDataURL(file);
    })
}
const imageToBase64 = (file) => {
  return new Promise((res,rej) => {
      const reader = new FileReader();
      reader.onload = () => {
          if(reader.readyState === 2){
              res(reader.result);
          }
      }
      reader.readAsDataURL(file);
  })
}
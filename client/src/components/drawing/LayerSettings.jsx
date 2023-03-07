
 




import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import {BsChevronDown} from 'react-icons/bs';

export default function LayerSettings({id,canvases, canvasesRaw, setCanvasesRaw, setActiveCanvas, layerid}) {
  async function handleSendBackwards(){
    // console.log(layerid);
    // let el = document.getElementById(layerid);
    // console.log(el);
    let canTrue = canvases.find(can=> can.id=== id); 
    // console.log(canvases);
    let canIndex = canvasesRaw.findIndex(can=> can.id=== id);
    // console.log(canIndex);
    if(canIndex > 0){
      let can = canvasesRaw[canIndex];
      // console.log(can)
     let canNewzIndex = (canvasesRaw[canIndex- 1].zIndex) - 0.05;
     
     can.zIndex = canNewzIndex;
    //  els.forEach(el=> {
      // console.log(canNewzIndex);
      // el.style.zIndex = canNewzIndex;
      // console.log(el.style.zIndex);
      // setActiveCanvas(canvases(canvases.length-1));
    //  })
     
     let newcans = canvasesRaw.map((canvas)=> {
       if(canvas.id === can.id){
         return can;
       }else{
         return canvas;
       }
     })
     console.log(newcans)
     for(var i = 0; i < newcans.length; i++){
    
      // Last i elements are already in place 
      for(var j = 0; j < ( newcans.length - i -1 ); j++){
         
        // Checking if the item at present iteration
        // is greater than the next iteration
        if(newcans[j].zIndex > newcans[j+1].zIndex){
           
          // If the condition is true then swap them
          var temp = newcans[j].zIndex
          newcans[j].zIndex = newcans[j + 1].zIndex
          newcans[j+1].zIndex = temp
        }
      }
    }
    //  let aftersort = newcans.sort((a, b)=> Number(a.zIndex) < Number(b.zIndex));
     console.log(newcans);
     setCanvasesRaw(newcans);
    
    }


 }
 async function handleSendToBack(){
   let canIndex = canvasesRaw.findIndex(can=> can.id=== id);
   if(canIndex > 0){
    let canNewzIndex = (canvasesRaw[0].zIndex) - 0.05;
    let can = canvasesRaw.find(can=> can.id=== id);
    can.zIndex = canNewzIndex;
    let newcans = canvasesRaw.map((canvas)=> {
      if(canvas.id === can.id){
        return can;
      }else{
        return canvas;
      }
    })
    setCanvasesRaw(newcans);

   
   }
 }
 async function handleBringForward(){
   let canIndex = canvasesRaw.findIndex(can=> can.id=== id);
   if(canIndex < canvasesRaw.length -1){
    let canNewzIndex = (canvasesRaw[canIndex+ 1].zIndex) + 0.05;
    let can = canvasesRaw.find(can=> can.id=== id);
    can.zIndex = canNewzIndex;
    let newcans = canvasesRaw.map((canvas)=> {
      if(canvas.id === can.id){
        return can;
      }else{
        return canvas;
      }
    })
    setCanvasesRaw(newcans);
   
   }
 }
 async function handleBringToFront(){
  let canTrue = canvases.find(can=> can.id=== id); 
 setActiveCanvas(canTrue);
  console.log(id);
   let canIndex = canvasesRaw.findIndex(can=> can.id=== id);
   console.log(canIndex)
   if(canIndex < canvasesRaw.length -1){
    console.log(canvasesRaw[canIndex]);
    let canNewzIndex = (canvasesRaw[canvasesRaw.length-1].zIndex) + 0.05;
    let can = canvasesRaw.find(can=> can.id=== id);
    can.zIndex = canNewzIndex;
    let newcans = canvasesRaw.map((canvas)=> {
      if(canvas.id === can.id){
        return can;
      }else{
        return canvas;
      }
    })
    
    newcans.sort((a, b)=> a.zIndex > b.zIndex);
    console.log(newcans);
    setCanvasesRaw(newcans);
    
   }
 }
  return (
    // <div className="fixed top-16 w-56 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex justify-center rounded-md  text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <BsChevronDown
              className="ml-2 -mr-1 h-5 w-5 text-black"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100000000]">
            <div className="px-1 py-1 w-full">
              <button className='text-md' style={{fontSize: "1.1rem", width: '14rem', textAlign: 'left'}} onClick={handleSendBackwards}>Send Backwards</button>


              <button className='text-md' style={{fontSize: "1.1rem",width: '14rem', textAlign: 'left'}} onClick={handleSendToBack}>Send to Back</button>


              <button className='text-md' style={{fontSize: "1.1rem", width: '14rem', textAlign: 'left'}} onClick={handleBringForward}>Bring Forward</button>


              <button className='text-md' style={{fontSize: "1.1rem", width: '14rem', textAlign: 'left'}} onClick={handleBringToFront}>Bring to Front</button>

            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    // </div>
  )
}


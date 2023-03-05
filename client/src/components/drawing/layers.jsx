import React from "react";
import {AiFillDelete} from 'react-icons/ai';

const Layers = ({canvasesRaw,setCanvasesRaw,setActiveCanvas, setCanvases, canvases,activeCanvas}) => {
    const activeStyle = "flex flex-row justify-between bg-primary-100 rounded-md p-1 py-1";
    const normalStyle = "flex flex-row justify-between  hover:bg-primary-50 rounded-md p-1";
    const deleteLayer = (id) => {
      let newCan = canvases.filter((can)=> {
            if(can.id !== id){
                return can;
            }
        }
        );
        let newCanRaw = canvasesRaw.filter((can)=> {
            if(can.id !== id){
                return can;
            }
        })
        setCanvasesRaw(newCanRaw);
        
        setCanvases(newCan);


        // console.log(canvasCount)
        // console.log(id)
        // let newCanCount = canvasCount.filter((can)=> {
        //       if(can.id !== id){
        //         return can;
        //       }
        // })
        // console.log(newCanCount)
        // let newcanv = canvases.filter((can)=> {
        //     if(can.id !== id){
        //         return can;
        //       }
        // })

    //     setCanvasCount(newCanCount);
    //     setActiveCanvas(newcanv[newcanv.length-1]);
    //     setCanvases(newcanv);

    }
    
    return (
        <div className="grid grid-cols-1 p-1">
            {canvasesRaw.map((canvas, idx)=> {
                return (<div className={canvas.id === activeCanvas.id? activeStyle: normalStyle} key={idx}><p onClick={()=> setActiveCanvas(canvas)} key={canvas.id} className="text-xl font-medium cursor-pointer hover:underline">{canvas.name}</p> <AiFillDelete onClick={()=> deleteLayer(canvas.id)} className="cursor-pointer" size={"1.4em"}/></div>)
            })}

       </div>)
}
export default Layers;
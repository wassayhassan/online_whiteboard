import React, {useRef, useEffect} from "react";
import {fabric} from 'fabric';
import {FcCursor} from 'react-icons/fc';
let options = {
    width: window.innerWidth,
    height: window.innerHeight,
    preserveObjectStacking: true,
    selection: false,
    selectable: false,
    // perPixelTargetFind: true,
  }

const Canvas = ({canva, index ,setActiveCanvas ,activeCanvas ,canvases,setCanvasesRaw, setCanvases, toolS}) => {
    const canvasRef = useRef(null);

  useEffect(()=> {
   let canvas = new fabric.Canvas(canvasRef.current, options);
   canvas.clear();
   canvas.id = canva.id;
   canvas.setHeight(window.innerHeight * 3);
   canvas.setWidth(window.innerWidth * 3);
    canva.objects?.forEach(({type,width,height,top,left,stroke,strokeWidth,fill,radius,angle,x1,x2,y1,y2,path,src,scaleX,scaleY,skewX,skewY, text, fontSize}, idx) => {
      switch(type){
        case 'rect':
          let newRectangle = new fabric.Rect({
            width,
            height,
            top,
            left,
            stroke,
            strokeWidth,
            fill,
            angle,
            scaleX,scaleY,skewX,skewY
          });
          canvas.add(newRectangle);
          canvas.requestRenderAll();
          break;
        case "circle":
          let  newCircle = new fabric.Circle({
            left,
            top,
            radius,
            stroke,
            strokeWidth,
            fill,
            angle,
            scaleX,scaleY,skewX,skewY
          });
          canvas.add(newCircle);
          canvas.requestRenderAll();
          break;
        case 'line':
          let   newLine = new fabric.Line([left,top,width+left,height+top],{
            stroke,
            strokeWidth,
            angle,
            scaleX,scaleY,skewX,skewY
          });
          canvas.add(newLine);
          canvas.requestRenderAll();
          break;
        case 'path':
          const stroke22 = getSvgPathFromStroke(path);
          const pencil = new fabric.Path(stroke22,{
            stroke,
            strokeWidth,
            angle,
            fill: 'transparent',
            scaleX,scaleY,skewX,skewY
          });
          canvas.add(pencil);
          canvas.requestRenderAll();
          break;
        case "image":
          fabric.Image.fromURL(src,function(img){
            img.set({left,top,width,height,angle,scaleX,scaleY,skewX,skewY})
            canvas.add(img);
            let diff = (canva.objects.length) - idx;
            for(let i = 1; i <= diff; i++){
              img.sendBackwards();
            }
            
            canvas.requestRenderAll();
          });
          break;
        case "textbox":
          const newText = new fabric.Textbox(text, {
            width,
            height,
            fontSize,
            fill,
            angle,
            scaleX,scaleY,skewX,skewY,
            top,
            left,
            editable: true,
            borderScaleFactor: 4
          });
          canvas.add(newText);
          canvas.requestRenderAll();
          break;
      }
    });
    canvas.selection = false;
    canvas.selectable = false;
   setCanvases((prev)=> [...prev, canvas]);
   setActiveCanvas(canvas);
   console.log("reloading")

   return () => {
    canvas.dispose()
  }


  }, [canva])
  
  console.log(toolS)
    return (

        <div className={`absolute top-0 left-0 ${canva.id}`}  key={index} >
        <canvas
              id={canva.id}
              className={canva.name}
              ref={canvasRef}
              style={{overflow: 'auto',
              zIndex: canva.zIndex     
            }}
            >
        </canvas>
    </div>
    )
}
export default Canvas;



const getSvgPathFromStroke = stroke => {
  if (!stroke.length) return "";
  let path = '';
  stroke.forEach(point => {
    point = point.join(' ');
    path += ' ' + point; 
  });

  return path;
};
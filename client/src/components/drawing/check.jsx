import React, {useEffect, useRef, useState, Fragment, useLayoutEffect, useCallback, createRef} from 'react'
import {fabric} from 'fabric';
import Hammer from "hammerjs"
import { HiChevronDown} from "react-icons/hi";
import UploadPDFModal from './UploadPDFModal';
import NameModal from './NameModal';
import Canvas from './canvas';
import {SlCursor} from 'react-icons/sl';
import { v4 as uuidv4 } from 'uuid';
import { SketchPicker } from 'react-color';
import io from 'socket.io-client';
import './style.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { ToastContainer, toast } from 'react-toastify';
import ReactScrollToBottom from 'react-scroll-to-bottom';
import Layers from './layers';
import { Popover } from '@headlessui/react';
import { Dropdown, DropdownComponent } from 'flowbite-react';
import {GrMenu, GrClose} from 'react-icons/gr';
import {BsSquare, BsCircle, BsPencil, BsFillLayersFill} from 'react-icons/bs';
import {AiOutlineSelect,AiOutlineZoomOut,AiOutlineZoomIn, AiOutlineBackward, AiFillForward} from 'react-icons/ai';
import {HiOutlineMinus} from 'react-icons/hi';
import {FaHandPaper} from 'react-icons/fa';
import {RiGalleryFill} from 'react-icons/ri';
import {BsLayers} from 'react-icons/bs';
import {CgColorPicker} from 'react-icons/cg';
import {BsFillCursorFill} from 'react-icons/bs';
import {FiShare2} from 'react-icons/fi';
import {TbViewportNarrow} from 'react-icons/tb';
import {MdOutlineMessage} from 'react-icons/md';
import {BiSend, BiText, BiAddToQueue, BiReset} from 'react-icons/bi';

import { image } from "../home/Home";
import { useParams } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';




const getSvgPathFromStroke = stroke => {
  if (!stroke.length) return "";
  let path = '';
  stroke.forEach(point => {
    point = point.join(' ');
    path += ' ' + point; 
  });

  return path;
};
var totalDeltaX = 0;
var totalDeltaY = 0;
let activeToolStyle = "bg-primary-100 p-2";
let normalToolStyle = ""
var viewportTransform;
let tool;
let canvas;
let newLine;
let newRectangle;
let newCircle;
let drawing = false;
let origX;
var zoomLevel = 1;
let origY;
let circleX1;
let color = 'black';
let strokeSize = 3;
let socket;
let roomSec = null;
let myPoint = {x: 0, y: 0};
let myWidth = window.innerWidth;
let myHeight = window.innerHeight;
let myZoom = 1;
let zoomPoint = {x: 0, y: 0}
let userId = null;
let unseen = 0;
let messBox = false;
let timerId = null;
let newText;
let recycle = [];
let TextfontSize = 30;
let options = {
  width: window.innerWidth,
  height: window.innerHeight,
  selection: false,
  selectable: false
}
const FabricJSCanvas = () => {
  const [textfontsettings, settextfrontsettings] = useState(false);
  const [users, setUsers] = useState([]);
  const [hammerEls, setHammerEls] = useState([]);
  const [strokeSettings, setStrokeSettings] = useState(false);
  const [readPdf, setReadPdf] = useState({});
  const [navActive, setNavActive] = useState(false);
  const [nameModel, setNameModel] = useState(false);
  const [toolS, setToolS] = useState('');
  const [boxColor, setBoxColor] = useState('black');
  const [strokeBoxSize, setStrokeBoxSize] = useState(3);
  const [pdfModalOpen, setpdfModalOpen] = useState(false);
  const [colorBoxOpen, setColorBoxOpen] = useState(false);
  const [strokeActive, setStrokeActive] = useState(false);
  const sizeList = [1,2,3,4,5,6,7,8,9,10];
  const [canvasesRaw, setCanvasesRaw] = useState([{id: uuidv4(), name: 'layer-0', zIndex: 0}]);
  const [canvases, setCanvases] = useState([])
  const [activeCanvas, setActiveCanvas] = useState({});
  const boxRef = useRef(null);
  const [myId, setMyId] = useState('');
  const [data, setData] = useState([]);
  const {roomId} = useParams();
  const [room, setRoom] = useState(null);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [point, setPoint] = useState(null);
  const [message, setMessage] = useState([]);
  const [myName, setMyName] = useState(null);
  const messageRef = useRef(null);
  const [messageBox, setMessageBox] = useState(false);
  const [type, setType] = useState('');
  const [textFontSizeBox, setTextFontSizeBox] = useState(false);
  const [textFontSize, setTextFontSize] = useState(30);
  const serverUrl = 'http://localhost:4000/';


  const handleMirror = useCallback(() => {
    // const width = activeCanvas.getWidth();
    // const height = activeCanvas.getHeight();
    // const zoom = activeCanvas.getZoom();
    // const {scrollTop, scrollLeft} = boxRef.current;
    // setWidth(width);
    // setHeight(height);
    // setZoom(zoom);
    // setPoint({y: scrollTop, x: scrollLeft});
    // setData(activeCanvas.getObjects());
    
    // if(roomId){
    //   socket.emit('mirror',{roomId, width, height, zoom, scrollTop, scrollLeft, zoomPoint});
    // }else{
    //   socket.emit('mirror',{roomId: roomSec, width, height, zoom, scrollTop, scrollLeft, zoomPoint});
    // }
  },[activeCanvas]);

  const onDraw = (e) => {
    if(userId && myName){
      const target = e.target;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let coord = {
        x, y
      };
      socket.emit('user-coord', {roomId: roomId? roomId:roomSec, userId, coord});
    }
 
  }

  useEffect(()=> {

      canvases.forEach((can)=> {
        can.on("object:added", handleObjectAdded);
        can.on("selection:created", handleObjectSelected);
        can.on("selection:updated", handleObjectSelected);
        can.on("selection:cleared", handleSelectionCleared);
        can.on("object:moving", handleObjectAdded);
        // can.on("touch:gesture", handleTouchGesture)
        // can.on("touch:drag", handleTouchDrag)
        can.on("mouse:wheel", (opt)=> {
          var delta = opt.e.deltaY;
          var zoom = can.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          can.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        });
      })
    return () => {
      canvases.forEach((can)=> {
        can.off("mouse:wheel", (opt)=> {
          var delta = opt.e.deltaY;
          var zoom = can.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          can.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        });
        // can.off("touch:drag", handleTouchDrag)
        can.off("object:added", handleObjectAdded);
        can.off("selection:updated", handleObjectSelected);
        can.off("selection:cleared", handleSelectionCleared);
        can.off("selection:created", handleObjectSelected);
        can.off("object:moving", handleObjectAdded);
        // can.off("touch:gesture", handleTouchGesture);
      })
    }


  }, [canvases]);

  async function handleTouchDrag(e){
    alert("e");
     console.log(e);
     
  }
  async function handleTouchGesture(e){
    alert("g")
    console.log("lauches")
     console.log(e);
  }

  async function handleSelectionCleared(){
     document.removeEventListener("keydown", async(e)=> {
      if(e.key === "Delete"){
        let objs = activeCanvas.getActiveObjects();
        objs.forEach((obj)=> {
          activeCanvas.remove(obj);
          activeCanvas.requestRenderAll();

        });
      }
      // if(e.keyCode === 127)
    });
  }

  async function handleObjectSelected(data){
    document.addEventListener('keydown', async(e)=> {
      if(e.key === "Delete"){
        let objs = activeCanvas.getActiveObjects();
        objs.forEach((obj)=> {
          activeCanvas.remove(obj);
          activeCanvas.requestRenderAll();

        });
      }
      // if(e.keyCode === 127)
    })
    // console.log(obj)
  }

  async function handleObjectAdded(){
    if(canvases.length > 0 && activeCanvas && (roomId || roomSec)){
      let sendCanvases = canvasesRaw.map((can, idx)=> {
        let objects = canvases[idx].getObjects();
        // let reverseObjects = objects.reverse();
        can.objects = objects;
        return can;
    })   
      let data = {
        roomId: roomId? roomId: roomSec,
        canvasesRaw: sendCanvases
      }

      socket.emit('send-element',data);
    }
  }

  const handlleRoom = useCallback(({roomId: Room}) => {
    setRoom(Room);
    roomSec = Room;
  },[]);

  const hanlderNewUserJoin = useCallback(({name, userId}) => {
    toast.info(`${name} join the room`);
    setUsers(pre=> [...pre, {name, userId}])
  },[]);

  const createRoom = useCallback((id) => {
    socket.emit('create-room',{userId: id});
  },[]);

  const hanlderRiciveElement = useCallback((data) => {
    // console.log(data);
    // setCanvases([]);
    setCanvases([]);
    setCanvasesRaw(data.canvasesRaw);

    // setTimeout(()=> {
    //   data.canvases.forEach((can)=> {
    //     let canva = new fabric.Canvas();
    //     canva.loadFromJSON(JSON.parse(can));
    //     canva.requestRenderAll();
    //     setCanvases((prev)=> [...prev, canva]);
    // })
    // }, 500)

    // setCanvases(data.canvases);
    
    // setData([...elements]);
  },[]);
  // useEffect(()=> {
  //   if(receivedCanvases.length> 0){

  //     setReceivedCanvases([]);
  //   }

  // }, [receivedCanvases])


  const handleMirrorRecive = useCallback(({width, height, zoom, scrollTop, scrollLeft, zoomPoint: zoomP}) => {
    setWidth(width);
    setHeight(height);
    setZoom(zoom);
    setPoint({y: scrollTop, x: scrollLeft});
    myWidth = width;
    myHeight = height;
    myZoom = zoom;
    myPoint = {y: scrollTop, x: scrollLeft};
    zoomPoint = zoomP;
  },[]);

  const handleLeave = useCallback(({name}) => {
    toast.info(`${name} left the room`);
  },[]);

  useEffect(() => {
    socket = io(serverUrl,{transports: ['websocket']});
    socket.on('connect',() => {
    setMyId(socket.id);
    userId = socket.id;
    if(roomId){
      setNameModel(true);
      // const name = window.prompt('Please Enter Your Name') || 'unknown';
      // setMyName(name);
      // socket.emit('join-rooms',{roomId, name, userId: socket.id});
    }else{
      createRoom(socket.id);
    }
    });

    socket.on('create-room', handlleRoom);
    socket.on('new-user', hanlderNewUserJoin);
    socket.on('recive-element', hanlderRiciveElement);
    socket.on('mirror', handleMirrorRecive);
    socket.on('leave', handleLeave);

    return () => {
      socket.off('create-room', handlleRoom);
      socket.off('new-user', hanlderNewUserJoin);
      socket.off('recive-element',hanlderRiciveElement);
      socket.off('mirror', handleMirrorRecive);
      socket.off('leave', handleLeave);
      socket.off('user-coord', handleReceiveCoord)
    }

  },[]);
  useEffect(()=> {
    if(socket){
      socket.on('user-coord', handleReceiveCoord)
    }
    return ()=> {
      socket.off('user-coord', handleReceiveCoord)
    }

  }, [socket, users])

  async function handleMouseWheel(opt){
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();

   }
  useEffect(()=> {
    if(hammerEls.length > 0 && toolS !== "panning"){
     
      canvases.forEach((can)=> {
        can.defaultCursor = "auto";
        can.on("object:added", handleObjectAdded);
        can.on("selection:updated", handleObjectSelected);
        can.on("selection:cleared", handleSelectionCleared);
        can.on("selection:created", handleObjectSelected);
        can.on("object:moving", handleObjectAdded);
      })
      hammerEls.forEach((hamm)=> {
        hamm.off("pan", function(e) {
          totalDeltaX += e.deltaX * 0.1;
          totalDeltaY += e.deltaY * 0.1;
          var newViewportTransform = [    viewportTransform[0], viewportTransform[1], viewportTransform[2],
            viewportTransform[3], viewportTransform[4] + totalDeltaX, viewportTransform[5] + totalDeltaY
          ];
          activeCanvas.setViewportTransform(newViewportTransform);
        });
        hamm.off("pinch", handlePinch)
      })
    }

  }, [hammerEls, toolS])

  async function handlePanning(){
    setToolS("panning");
    canvases.forEach((can)=> {
      can.defaultCursor = "grab";
    })
    var hammer = new Hammer(activeCanvas.wrapperEl);
    hammer.get('pinch').set({ enable: true });
    activeCanvas.hoverCursor = 'grab';
    var viewportTransform = activeCanvas.viewportTransform;
    hammer.on('pan', function(e) {
      totalDeltaX += e.deltaX * 0.1;
      totalDeltaY += e.deltaY * 0.1;
      var newViewportTransform = [    viewportTransform[0], viewportTransform[1], viewportTransform[2],
        viewportTransform[3], viewportTransform[4] + totalDeltaX, viewportTransform[5] + totalDeltaY
      ];
      activeCanvas.setViewportTransform(newViewportTransform);
    });


    hammer.on('pinch', handlePinch)


    activeCanvas.discardActiveObject();
     activeCanvas.off("object:added", handleObjectAdded);
     activeCanvas.off("selection:updated", handleObjectSelected);
     activeCanvas.off("selection:cleared", handleSelectionCleared);
     activeCanvas.off("selection:created", handleObjectSelected);
     activeCanvas.off("object:moving", handleObjectAdded);
     activeCanvas.off('mouse:down',handleMouseDown);
     activeCanvas.off('mouse:move',handleMouseMove);
     activeCanvas.off('mouse:up',handleMouseUp);
     activeCanvas.isDrawingMode = false;
     
     activeCanvas.getObjects().forEach((obj)=> {
      obj.selectable = false;
     })

     activeCanvas.selection = false;
     setHammerEls((pre)=> [...pre, hammer]);

  }

  async function handlePinch(e){
    // console.log(e)
    let canvas = activeCanvas;
    canvases.forEach((canvas)=> {
      var zoom = canvas.getZoom();
      zoom *= 0.999 ** (e.deltaY);

      // let lastZoom = zoomLevel;
      // let pinchZoom = e.scale * lastZoom 
      // console.log("pinch zoom")
      // console.log(pinchZoom);
    
      // if (pinchZoom < 0.1 ) pinchZoom = 0.1
      // if(pinchZoom > 20) pinchZoom  = 20
    
      let center = canvas.getCenter();
      // console.log(canvas);
      // console.log(e)
      let point = new fabric.Point(e.center.x, e.center.y);
      // const deltaPoint = point.subtract(center);
      // const zoomPoint = deltaPoint.divide(lastZoom).multiply(pinchZoom).add(center);
    
      // zoomLevel = pinchZoom;
    
      // const canvasZoom = canvas.getZoom();
      // const newZoom = pinchZoom / canvasZoom;
      // console.log("zoom point");
      // console.log(point);
      // console.log(newZoom);

    
      canvas.zoomToPoint(point, zoom);
      e.preventDefault();

      
  })
}

  const handleTouchStart = (event) => {
    console.log(event)
    console.log("hello");
    event.preventDefault();
    const delta = event.deltaY;
    const zoom = canvases[0].getZoom();

    const newZoom = zoom + delta / 200;

    if (newZoom > 10) {
      return;
    }
    const point = new fabric.Point(activeCanvas.getWidth() / 2, activeCanvas.getHeight() / 2);
    canvases.forEach((can)=> {
      can.zoomToPoint(point, newZoom);
    })
    // activeCanvas.zoomToPoint(point, newZoom);
  };



  const  handleReceiveCoord = (data) =>{
      let us = users.find(u=> u.userId === data.userId);
      if(us){
        us.coord = data.coord;

        let newUsers = users.map((u)=> {
          if(u.userId === us.userId){
            return us;
          }else{
            return u;
          }
        })
        setUsers(newUsers);
      }else{
        setUsers(pre=> [...pre, data]);
      }

  }
  
  function closeNameModal(namein) {
    setMyName(namein);
    socket.emit('join-room',{roomId, name:namein, userId});
    setNameModel(false)
  }


//   async function handleChangeActiveCanvas(num){
//     setActiveCanvas(canvases[num]);
//  }
// useEffect(()=> {
//   console.log(canvases)
//    canvases.forEach((canvas, index)=> {
//     canvas.setElement(`canvas-${index}`);
//     canvas.renderAll();
//    })
// }, [canvases])

 async function createLayer(){
  
  // const newCanvas = new fabric.Canvas(`canvas-${canvasesRaw.length}`);
  // newCanvas.id = uuidv4();
  // newCanvas.name = `layer-${canvasesRaw.length}`
  let preZindex;
  if(canvasesRaw.length > 0){
    preZindex = canvasesRaw[canvasesRaw.length-1]?.zIndex;
    preZindex++;
  }else{
    preZindex = 0;
  }
  let newCanvasRaw = {
    name: `layer-${canvasesRaw.length}`,
    zIndex: preZindex,
    id: uuidv4()
  }
  // newCanvas.zIndex = preZindex;
    setCanvasesRaw(pre=> [...pre, newCanvasRaw]);
    // setActiveCanvas(newCanvas);
  // console.log(canvasRefs);
  // let ref = createRef();
  // canvasRefs.current.push(ref);
  // canvas = new fabric.Canvas(ref.current,options)
  // canvas.clear();
  // console.log("hello")
  // let children = document.querySelector(".canvasesdiv").childNodes;

  //  let el = document.createElement("canvas");
  //  el.id = uuidv4();
  //  el.classList.add(`layer${children+1}`);
  //  let parel = document.querySelector(".canvasesdiv");
  //  parel.appendChild(el);
  // var el = document.querySelector('layer1');
  //  let c = new fabric.Canvas(`${canvasCount.length-1}`,options)
  //  c.name = `layer${children.length}`;

  //  setCanvasesRaw(prev=> [...prev, {id: uuidv4(), zIndex: preZindex, name: `layer${canvasesRaw.length+1}`}])

  //  c.clear();
  //  setActiveCanvas(c);
  //  setCanvases((prev)=> [...prev, c]);
 }

  useLayoutEffect(() => {
  //    canvas = new fabric.Canvas(canvasCount[0].id,options);
  //   console.log(canvas);
  //   canvas.id = canvasCount[0].id;
  //   canvas.clear();
  //   console.log("ran in useeffect")
    
  //   setCanvases((pre)=> [...pre, canvas]); 
  //   setActiveCanvas(canvas)


  //   if(image){
  //     fabric.Image.fromURL(image,function(img){
  //       img.set('left',window.innerWidth/3).set('top',window.innerHeight/3)
  //       canvas.add(img);
  //       canvas.requestRenderAll();
  //     });
  //   }

  //   if(data.length !== 0){
  //       data.forEach(({type,width,height,top,left,stroke,strokeWidth,fill,radius,angle,x1,x2,y1,y2,path,src,scaleX,scaleY,skewX,skewY, text, fontSize}) => {
  //         switch(type){
  //           case 'rect':
  //             newRectangle = new fabric.Rect({
  //               width,
  //               height,
  //               top,
  //               left,
  //               stroke,
  //               strokeWidth,
  //               fill,
  //               angle,
  //               scaleX,scaleY,skewX,skewY
  //             });
  //             canvas.add(newRectangle);
  //             canvas.requestRenderAll();
  //             break;
  //           case "circle":
  //             newCircle = new fabric.Circle({
  //               left,
  //               top,
  //               radius,
  //               stroke,
  //               strokeWidth,
  //               fill,
  //               angle,
  //               scaleX,scaleY,skewX,skewY
  //             });
  //             canvas.add(newCircle);
  //             canvas.requestRenderAll();
  //             break;
  //           case 'line':
  //             newLine = new fabric.Line([left,top,width+left,height+top],{
  //               stroke,
  //               strokeWidth,
  //               angle,
  //               scaleX,scaleY,skewX,skewY
  //             });
  //             canvas.add(newLine);
  //             canvas.requestRenderAll();
  //             break;
  //           case 'path':
  //             const stroke22 = getSvgPathFromStroke(path);
  //             const pencil = new fabric.Path(stroke22,{
  //               stroke,
  //               strokeWidth,
  //               angle,
  //               fill: 'transparent',
  //               scaleX,scaleY,skewX,skewY
  //             });
  //             canvas.add(pencil);
  //             canvas.requestRenderAll();
  //             break;
  //           case "image":
  //             fabric.Image.fromURL(src,function(img){
  //               img.set({left,top,width,height,angle,scaleX,scaleY,skewX,skewY})
  //               canvas.add(img);
  //               canvas.requestRenderAll();
  //             });
  //             break;
  //           case "textbox":
  //             const newText = new fabric.Textbox(text, {
  //               width,
  //               height,
  //               fontSize,
  //               fill,
  //               angle,
  //               scaleX,scaleY,skewX,skewY,
  //               top,
  //               left,
  //               editable: true,
  //               borderScaleFactor: 4
  //             });
  //             canvas.add(newText);
  //             canvas.requestRenderAll();
  //             break;
  //         }
  //       });
  //   }
  //   if(width && height && zoom && point){
  //     canvas.setWidth(width);
  //     canvas.setHeight(height);
  //     canvas.setZoom(zoom);
  //     canvas.zoomToPoint(zoomPoint,zoom);
  //     boxRef.current.scrollTo(point.x, point.y);
  //   }else{
  //     canvas.setWidth(myWidth);
  //     canvas.setHeight(myHeight);
  //     canvas.setZoom(myZoom);
  //     boxRef.current.scrollTo(myPoint.x, myPoint.y);
  //     canvas.zoomToPoint(zoomPoint,myZoom);
  //   }
  //   console.log(data);
  //   console.log(width);
  //   console.log(height);
  //   console.log(zoom);
  //   console.log(point)

  //   return () => {
  //     canvas.dispose()
  //   }

  }, [data, width, height, zoom, point]);


  // increace width 
  useEffect(() => {
    // if(activeCanvas.id){
    //   // console.log(activeCanvas)
    //   // activeCanvas.setWidth(window.innerWidth * 3);
    //   // activeCanvas.setHeight(window.innerHeight * 3); 
    //   // boxRef.current.scrollTo(canvas.getWidth()/1.2, canvas.getHeight()/1.2);
    // }

  },[activeCanvas]);

  const handlePencil = useCallback(() => {
    if(recycle.length !== 0){
      recycle = [];
    }
    // console.log(canvas);

    activeCanvas.off('mouse:down',handleMouseDown);
    activeCanvas.off('mouse:move',handleMouseMove);
    activeCanvas.off('mouse:up',handleMouseUp);
    activeCanvas.isDrawingMode = true;
    activeCanvas.selectable = false;
    activeCanvas.evented = false;
    setStrokeActive(!strokeActive);
    tool = 'pencil'
    setToolS('pencil');
    
    activeCanvas.forEachObject(function(object){ 
      object.selectable = false;
      object.hoverCursor = 'auto'; 
    });
    
  },[activeCanvas]);


  const handlerSelect = () => {
    activeCanvas.selection = true;
    activeCanvas.selectable = true;
    activeCanvas.evented = true;
    activeCanvas.off('mouse:down',handleMouseDown);
    activeCanvas.off('mouse:move',handleMouseMove);
    activeCanvas.off('mouse:up',handleMouseUp);
    activeCanvas.isDrawingMode = false;
    setToolS('selection');
    tool = 'selection';
    activeCanvas.forEachObject(function(object){ object.selectable = true });
    if(recycle.length !== 0){
      recycle = [];
    }
  }

  const toolHandler = (toolName) => {
    
    tool = toolName
    setToolS(toolName)
    activeCanvas.isDrawingMode = false;
    activeCanvas.selectable = false;
    activeCanvas.selection = false;
    activeCanvas.evented = false;
    activeCanvas.on('mouse:down',handleMouseDown);
    activeCanvas.on('mouse:move',handleMouseMove);
    activeCanvas.on('mouse:up',handleMouseUp);

    activeCanvas.forEachObject(function(object){ 
      object.selectable = false;
      object.hoverCursor = 'auto'; 
    });

    if(recycle.length !== 0){
      recycle = [];
    }
  }

  function handleMouseDown(o){
    const pointer = activeCanvas.getPointer(o.e);
    drawing = true;
    if(tool === 'line'){
      newLine = new fabric.Line([pointer.x, pointer.y ,pointer.x, pointer.y],{
        stroke: color,
        strokeWidth: 3
      });
      activeCanvas.add(newLine);
      activeCanvas.requestRenderAll();
      activeCanvas.selectable = false;
    }else if(tool === 'rectangle'){
      origX = pointer.x;
      origY = pointer.y;
      newRectangle = new fabric.Rect({
        width: 0,
        height: 0,
        top: pointer.y,
        left: pointer.x,
        stroke: color,
        strokeWidth: 3,
        fill: 'transparent'
      });
      activeCanvas.add(newRectangle);
      activeCanvas.requestRenderAll();
      activeCanvas.selectable = false;
    }else if(tool === 'circle'){
      circleX1 = pointer.x;
      newCircle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 0,
        stroke: color,
        strokeWidth: 3,
        fill: 'transparent'
      });
      activeCanvas.add(newCircle);
      activeCanvas.requestRenderAll();
      activeCanvas.selection = false;
      activeCanvas.selectable = false;
    }else if(tool === 'text'){
      origX = pointer.x;
      origY = pointer.y;
      newText = new fabric.Textbox('', {
        width: 0,
        height: 0,
        editable: true,
        top: pointer.y,
        left: pointer.x,
        borderScaleFactor: 4,
        fill: color,
        fontSize: TextfontSize
      });
      activeCanvas.add(newText);
      activeCanvas.requestRenderAll();
    }
  };

  function handleMouseMove(o){
    const pointer = activeCanvas.getPointer(o.e);
    if(!drawing){
      return false
    }

    if(tool == 'line'){
      newLine.set({
        x2: pointer.x,
        y2: pointer.y
      });
    }else if(tool == 'rectangle'){
      let x = Math.min(pointer.x, origX);
      let y = Math.min(pointer.y, origY);
      let w = Math.abs(origX - pointer.x);
      let h = Math.abs(origY - pointer.y);
      newRectangle.set('top',y).set('left',x).set('height',h).set('width',w)
    }else if(tool == 'circle'){
      newCircle.set('radius',Math.abs(pointer.x - circleX1));
    }else if(tool == 'text'){
      let x = Math.min(pointer.x, origX);
      let y = Math.min(pointer.y, origY);
      let w = Math.abs(origX - pointer.x);
      let h = Math.abs(origY - pointer.y);
      newText.set('top',y).set('left',x).set('height',h).set('width',w);
    }
    activeCanvas.requestRenderAll();
    activeCanvas.selectable = false;
  };

  const handleMouseUp = event => {
    drawing = false;
    const getLastElement = activeCanvas.getObjects().length -1;
    activeCanvas.setActiveObject(activeCanvas.item(getLastElement));
    activeCanvas.requestRenderAll();
    handlerSelect();
  };
  // useEffect(()=> {
  //   canvases.forEach(can=> {
  //       if(socket && canvases.length > 0 && activeCanvas && (roomId || roomSec)){
  //         let sendCanvases = canvasesRaw.map((can, idx)=> {
  //           let objects = canvases[idx].getObjects();
  //           can.objects = objects;
  //           return can;
  //       })   
  //         let data = {
  //           roomId: roomId? roomId: roomSec,
  //           canvasesRaw: sendCanvases
  //         }
  //         console.log(canvasesRaw);
    
  //         socket.emit('send-element',data);
  //       }
  //   })
  // }, [canvasesRaw, socket])

  const handleZoomIn = () => {
    canvases.forEach((canvas)=> {
      canvas.setZoom(canvas.getZoom() + 0.1, canvas.getZoom() + 0.1);
      canvas.setWidth(canvas.getWidth() + 80);
      canvas.setHeight(canvas.getHeight() + 80);
      canvas.selectable = false;
      canvas.evented = false;
      myWidth = canvas.getWidth();
      myHeight = canvas.getHeight();
      myZoom = canvas.getZoom();
    })

  }

  const handleZoomOut = () => {
    canvases.forEach((canvas)=> {
      canvas.setZoom(canvas.getZoom() - 0.1, canvas.getZoom() - 0.1);
      canvas.selectable = false;
      canvas.evented = false;
    })

  };

  const handleZoomReset = () => {
    canvases.forEach((canvas)=> {
      canvas.setZoom(1,1);
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.selectable = false;
      canvas.evented = false;
    })

  }

  const handleColor = (c) => {
    setBoxColor(c.hex);
    color = c.hex;
    activeCanvas.freeDrawingBrush.color = c.hex;
  }

  const handleStroke = (e) => {
    strokeSize = e.target.value;
    setStrokeBoxSize(e.target.value);

    activeCanvas.freeDrawingBrush.width = parseInt(e.target.value, 10) || 1;
  }

  //  // bg image handler 
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

    async function onUpload(e) {
        const file = e.target.files[0];
        let fileExtension = file.name.split('.');
        fileExtension = fileExtension[fileExtension.length -1];
        if(fileExtension !== 'pdf'){
            const imageLoad = await imageToBase64(file);
            if(imageLoad){
              fabric.Image.fromURL(imageLoad,function(img){
                img.set('left',window.innerWidth/3).set('top',window.innerHeight/3)
                activeCanvas.add(img);
                activeCanvas.requestRenderAll();
                activeCanvas.selectable = false;
              });
            }
            return
        }

        const data = await readFileSync(file);
        renderPDF(data);
      }
       
      
      async function renderPDF(data) {
        try{
            const pdf = await window.pdfjs.getDocument({data}).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({scale: 1});
            // const Dcanvas = activeCanvas.getElement();
            // console.log(Dcanvas)
            // const canvasContext = Dcanvas.getContext("2d");
            // console.log(canvasContext);
            
            // const Dcanvas = document.getElementById()
            const Dcanvas = document.createElement('canvas');
            const canvasContext = Dcanvas.getContext('2d');
            Dcanvas.height = viewport.height;
            Dcanvas.width = viewport.width;
            await page.render({canvasContext, viewport}).promise;
              // Get the image object and move it to the background layer
              const pdfImage = new fabric.Image(Dcanvas, { left: 0, top: 0, selectable: false });
              activeCanvas.add(pdfImage);
              activeCanvas.renderAll();
            
            // const firstImage = Dcanvas.toDataURL('image/png');
            // if(firstImage){
            //   fabric.Image.fromURL(firstImage, {},function(img){
            //     img.set('left',window.innerWidth/3).set('top',window.innerHeight/3)
            //     activeCanvas.add(img);
            //     img.sendBackwards();
            //     activeCanvas.requestRenderAll();
            //     activeCanvas.selectable = false;
            //     setToolS("selection")
            //   });
            // }
        }catch(err){
            console.log(err.message)
        }   
    }
    async function loadPDF(){
     let pdf = await window.pdfjs.getDocument({data}).promise;
     let pages = await pdf.numPages();    
    }

  const onScroll = useCallback(() => {
  //   const {scrollTop, scrollLeft, scrollHeight, clientHeight, clientWidth, scrollWidth} = boxRef.current;
  //   myPoint = {y: scrollTop, x: scrollLeft};
  //   myWidth = activeCanvas.getWidth();
  //   myHeight = activeCanvas.getHeight();
  //   myZoom = activeCanvas.getZoom();

  //   console.log(scrollHeight, clientHeight)
  //   if(scrollTop + clientHeight >= scrollHeight){
  //     activeCanvas.setHeight(activeCanvas.getHeight() + 100);
  //   }

  //   if(scrollLeft + clientWidth >= scrollWidth){
  //     activeCanvas.setWidth(activeCanvas.getWidth() + 100);
  //   }

  //   myWidth = activeCanvas.getWidth();
  //   myHeight = activeCanvas.getHeight();
  //   myZoom = activeCanvas.getZoom();
  },[activeCanvas]);
  

  const deleteElement = useCallback((e) => {
    const keyID = e.keyCode;
    const activeElement = activeCanvas.getActiveObject();
    if(keyID == 46 && activeElement){
      activeCanvas.remove(activeElement);
      recycle.push(activeElement);
    }
  },[activeCanvas]);

  // // add key event
  useEffect(() => {
    // document.addEventListener('keydown',deleteElement);
    return () => {
      // document.removeEventListener('keydown',deleteElement);
    }
  },[]);

  const handleBack = useCallback(() => {
    
    const lastEle = activeCanvas.getObjects().pop();
    if(!lastEle) return;
    recycle.push(lastEle);
    activeCanvas.remove(lastEle);
  },[activeCanvas]);

  const handleForward = useCallback(() => {
    if(recycle.length === 0) return;
    const lastEle = recycle.pop();
    activeCanvas.add(lastEle);
    activeCanvas.requestRenderAll();
  },[activeCanvas]);

  const handleFontSize = useCallback((e) => {
    setTextFontSize(e.target.value);
    if(Number(e.target.value) !== NaN){
      TextfontSize = Number(e.target.value);
    }
  },[]);


  return (
  <>
    {users.map((user)=> {
        console.log(user);
           if(user && user.userId !== userId && user.coord){
            return <div style={{top: user.coord.y + "px",left: user.coord.x + "px"}} className={`absolute`}><SlCursor size={"1.4em"} /> <p className='text-lg font-medium p-1'>{user.name}</p></div>
           }
       })}
  <NameModal nameModel={nameModel} setNameModel={setNameModel} closeNameModal={closeNameModal} />
  <UploadPDFModal pdfModalOpen={pdfModalOpen} setpdfModalOpen={setpdfModalOpen} onUpload={onUpload} readPdf = {readPdf} setReadPdf={setReadPdf} activeCanvas={activeCanvas} />
    <div className='box' onMouseMove={(e) => onDraw(e)} ref={boxRef} onScroll={onScroll}>

      <nav className={`left_nav ${navActive ? 'active z-[10000000]': ' z-[10000000]'}`}>
            <div className='buttons'>
                <button onClick={handleBack}><AiOutlineBackward/></button>
                <button onClick={handleForward}><AiFillForward/></button>
                <button onClick={handleMirror}><TbViewportNarrow/></button>
                <button onClick={handleZoomIn}><AiOutlineZoomIn/></button>
                <button onClick={handleZoomOut}><AiOutlineZoomOut/></button>
                <button onClick={handleZoomReset}><BiReset/></button>
                {
                  !roomId &&
                  <CopyToClipboard text={`${window.location.href}/${room}`}>
                    <button title='copy share link'><FiShare2/></button>
                  </CopyToClipboard>
                }
            </div>
        </nav>
        {   navActive
            ?
            <span className='menu'><GrClose onClick={() => setNavActive(!navActive)}/></span>
            :
            <span className='menu'><GrMenu onClick={() => setNavActive(!navActive)}/></span>
        }

        <nav className='top_nav z-[10000000]'>
          <button className={toolS === "panning"? activeToolStyle : normalToolStyle} onClick={handlePanning} id="panning">
            <FaHandPaper />
          </button>
            <button className={toolS === "selection"? activeToolStyle : normalToolStyle}
            id="selection"
            onClick={handlerSelect}
            ><BsFillCursorFill/></button>
            
            <button className={toolS === "rectangle"? activeToolStyle : normalToolStyle}
             id="rectangle"
             onClick={() => toolHandler("rectangle")}
            ><BsSquare/></button>

            <button className={toolS === "circle"? activeToolStyle : normalToolStyle}
            id="circle"
             onClick={() => toolHandler("circle")}
            ><BsCircle/></button>
            <button className={toolS === "line"? activeToolStyle : normalToolStyle}
            id="line" onClick={() => toolHandler('line')}
            ><HiOutlineMinus/></button>

            <button className={(toolS === "text"? activeToolStyle : normalToolStyle)+ "flex flex-row"} style={{display: "flex", flexDirection: "row"}}
            id="text" onClick={() => {toolHandler('text'); setTextFontSizeBox(!textFontSizeBox)}}
            ><BiText/> 
              <HiChevronDown  style={{fontSize: "0.8em"}} className="hover:bg-gray-100" onClick={()=> settextfrontsettings(prev=> !prev)} />
           
            </button>
            {
              textfontsettings &&
              <div className='stroke_box flex_d_col'>
                  <label >
                    Font Size
                  </label>
                  <input type='text' placeholder='stroke width' value={textFontSize} onChange={(e) => handleFontSize(e)}/>
              </div>
            }
            
            <button className={tool === "pencil"? activeToolStyle : normalToolStyle} style={{display: "flex", flexDirection: "row"}}
            id="pencil"
            onClick={() => {handlePencil(); setStrokeActive(!strokeActive);}}
            ><BsPencil/>
            <HiChevronDown style={{fontSize: "0.8em"}} className="hover:bg-gray-100"  onClick={()=> setStrokeSettings(prev=> !prev)} />

            </button>

            {
              strokeSettings &&
              <div className='stroke_box flex_d_col'>
                  <label >
                    Stroke Width
                  </label>
                  <input type='text' placeholder='stroke width' list='size' value={strokeBoxSize} onChange={handleStroke}/>
                  <datalist id='size'>
                      {
                        sizeList.map((size,i) => <Fragment key={i}><option value={size}/></Fragment>)
                      }
                  </datalist>
              </div>
            }
            <button onClick={() => setColorBoxOpen(!colorBoxOpen)}><CgColorPicker/></button>
            
            {
              colorBoxOpen &&
              <div className='color_picker stroke_box'>
                <SketchPicker color={boxColor}  onChangeComplete={handleColor} defaultValue='#452135'/>
              </div>
            }
            {/* <input type='file' style={{display: 'none'}} id='chooseFile' onChange={onUpload}/> */}
            <button onClick={()=> setpdfModalOpen(true)}><RiGalleryFill/></button>
           {/* <button className='relative'><BsLayers /></button> */}
            {/* <button className=''> */}
            {/* <div className='btn01 relative'> */}
            {/* <BsLayers /> */}
            {/* <div className="absolute  right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                <div className="py-1 " role="none">
                  <div  className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex="-1" id="menu-item-0">Account settings</div>
                  <div className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex="-1" id="menu-item-1">Support</div>
                  <div className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" tabIndex="-1" id="menu-item-2">License</div>
                </div>
             </div>  */}
            {/* </div> */}
            <Popover className="relative bg-white">
           
              <Popover.Button> <BsLayers /> </Popover.Button>

                <Popover.Panel className="absolute z-10 w-[20rem] bg-white p-1 border-gray-50 border-[1px] rounded-md">
                  <div className='flex flex-row justify-between w-full p-1'>
                    <p className='text-2xl font-medium'>Layers</p>
                    <p className='text-2xl cursor-pointer text-blue-700 font-medium hover:underline' onClick={createLayer}>Create Layer</p>
                  </div>
                  <hr/>
                  <Layers canvasesRaw={canvasesRaw} setCanvases={setCanvases} canvases={canvases} setCanvasesRaw={setCanvasesRaw} setActiveCanvas={setActiveCanvas} activeCanvas={activeCanvas}/>
                </Popover.Panel>
             </Popover> 

            {/* </button> */}
             
  


      </nav>

      <div className='canvasesdiv relative'>
        {canvasesRaw.map((canva, idx)=> {
          {console.log(canva)}
          return <Canvas canva={canva} index={idx} toolS={toolS} key={idx} setActiveCanvas={setActiveCanvas} activeCanvas={activeCanvas} canvases={canvases} setCanvases={setCanvases} />
        })}
       {/* {canvasRefs.current.map((canvasREF, idx)=> {
        return( <div className=' absolute top-0 left-0' key={idx}>
        <canvas
          key={idx}
              // id={canva.id}
              // className={canva.name}
              ref={canvasREF}
              style={{overflow: 'auto', 
              // zIndex: canva.zIndex
            }}
            >
        </canvas>
    </div>)
       })} */}

      </div>

      </div>

      <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          // theme="dark"
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
  </>);
}
export default FabricJSCanvas;
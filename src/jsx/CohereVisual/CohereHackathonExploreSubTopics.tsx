import {  useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as React from "react";
// Would refactor elsewhere if not hackathon..

export const  cosineSimilarity = (vector1, vector2) => {
  const v1 = vector1 // Array.from(vector1.values());
  const v2 = vector2 // Array.from(vector2.values());
  let dotProduct = 0.0;
  let ss1 = 0.0;
  let ss2 = 0.0;
  const length = Math.min(v1.length, v2.length);
  for (let i = 0; i < length; i++) {
    // Ignore pairs that will not affect either the dot product or the magnitude
    if (v1[i] === 0 && v2[i] === 0) continue;
    dotProduct += v1[i] * v2[i];
    ss1 += v1[i] * v1[i];
    ss2 += v2[i] * v2[i];
  }
  const magnitude = Math.sqrt(ss1) * Math.sqrt(ss2);
  const value =  magnitude ? dotProduct / magnitude : 0.0;
  return Math.abs(value)
}


type SubTopicData = Array<{
  topic: string,
  embed: Array<number>,
  image: string, // base64
  definition: string
}>

type ExploreSubTopicsProps = {
  topic: string,
  subtopicData:  SubTopicData
}


// @display @priority-ui
export const CohereHackathonExploreSubTopics = ({topic,  subtopicData}: ExploreSubTopicsProps) => {

  topic = topic.toLowerCase()

  const closest3Dict = getClosestAsDict(subtopicData)
  let conceptsAsDict = {}
  subtopicData.forEach((concept) => {
    conceptsAsDict[concept.topic] = concept;
  })

  const [currentlyViewing, setCurrentlyViewing] = useState(topic)

  console.log('Closest dict is: ', closest3Dict)

  const graphData = {
    nodes: subtopicData.map((concept) => ({ id: concept.topic, title: concept.topic, name: concept.topic, img: concept.image, })),
    links: []
  };

  /*
  subtopicData
        .map(concept => ({
          source: concept.topic,
          // todo: Closet 3.
          target: closest3Dict[concept.topic][0].topic
        }))
   */


  useEffect(() => {
    console.log('Subtopic data was: ', subtopicData)
    const gData = {
      nodes: subtopicData.map((concept) => ({ id: concept.topic, title: concept.topic, name: concept.topic, img: {},  imgData: concept.image,
        color: 'gold'})),
      links: [],
    };
    console.log('g data: ', gData)

  }, []);


  const fgRef = useRef();

  // Code from React Force Graph demos.
  const handleClick = useCallback(node => {
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    setCurrentlyViewing(node.name)

    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }, [fgRef]);

  return (<div>
    <h3>
      Exploring {topic}
      {currentlyViewing !== topic && <small className="tertiary">, {currentlyViewing}</small>}
    </h3>

    {/*
    This code does useful expansion/hiding on click:
    https://github.com/vasturiano/react-force-graph/blob/master/example/expandable-nodes/index.html
    */}

    {/* 2D uses nodeCanvasObject and 3D uses  nodeThreeObject.
    Uncomment as you wish to experience in 2D or 3D, I find 2D is easier. */}

    <ForceGraph3D
      graphData={graphData}

      onNodeClick={handleClick}

      ref={fgRef}

      nodeThreeObject={(obj) => {
          // below should be imported by index.html
          let img = obj.img
          console.log('Image is: ', img)
          const src = "data:image/jpg;base64, " + img
          const imgTexture = new THREE.TextureLoader().load(src);
          // const imgTexture = THREE.ImageUtils.loadTexture( src );
          const material = new THREE.SpriteMaterial({ map: imgTexture });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(12, 12);

          return sprite;
      }}
    />

    <div hidden={currentlyViewing === topic} style={{
      position: 'fixed',
      zIndex: 1000,
      padding: '10px',
      bottom: '0px',
      verticalAlign: 'bottom',
      color: 'white',
      left: '0px',
      right: '0px',
      backgroundColor: 'rgb(30,30,30)',
    }}>
      <div className="row">
      {closest3Dict[currentlyViewing].map((relatedTopic) => <div className="col-md-4">
        <div className="shadowed-slim" style={{maxHeight:"30vh", borderRadius:"15px", overflowY:"scroll"}}>
          <img src={"data:image/jpg;base64, " + conceptsAsDict[relatedTopic].image} style={{width:"100%"}} />
          <div style={{padding:"5px", fontSize:"1.5em"}} className="text-center">{relatedTopic}</div>
          <p style={{padding:"10px", backgroundColor:"ligthgray", color:"white"}}>
            <i className="fa fa-2x fa-lightbulb" style={{color:"gold"}} />
            <small>
              {Object.keys(conceptsAsDict[relatedTopic].definition).map((key) => <div>
                {conceptsAsDict[relatedTopic].definition[key]}
              </div>)}
            </small>
          </p>
          <div className="text-center">
            <a onClick={() => setCurrentlyViewing(relatedTopic)} className="btn btn-secondary">
              <i className="fa fa-expand" /> Explore
            </a>
          </div>
        </div>
      </div>)}
      </div>

    </div>



  </div>)
}

function compareNumbersDescending(a, b) {
  return b - a;
}

function compareNumbersAscending(a, b) {
  return a - b;
}

const getClosestAsDict = (subtopicData: SubTopicData) => {
  let dict = {}

  subtopicData.forEach((concept) => {
    const embedForThisConcept = concept.embed

    const cosines = subtopicData.map((otherConcept) => {
      return cosineSimilarity(embedForThisConcept, otherConcept.embed)
    })

    console.log('Cosines: ', cosines)

    const sortedHighestCosineToLowest3 = ([...cosines].sort(compareNumbersAscending)).slice(1, 4)
    // by slicing the 1st one off, we ignore the (current topic) as it will be cosine ~=1

    dict[concept.topic] = sortedHighestCosineToLowest3.map((cosineWhichWasHigh) => {
      console.log('Matching index: ', cosines.indexOf(cosineWhichWasHigh))
      console.log(subtopicData[cosines.indexOf(cosineWhichWasHigh)])
      return subtopicData[cosines.indexOf(cosineWhichWasHigh)].topic
    })

  })

  return dict
}


// @display @priority-ui
export const CohereHackathonExploreSubTopicsOld = ({topic,  subtopicData}: ExploreSubTopicsProps) => {

  topic = topic.toLowerCase()

  const closest3Dict = getClosestAsDict(subtopicData)
  let conceptsAsDict = {}
  subtopicData.forEach((concept) => {
    conceptsAsDict[concept.topic] = concept;
  })

  const [currentlyViewing, setCurrentlyViewing] = useState(topic)

  console.log('Closest dict is: ', closest3Dict)

  return (<div>
    <h3>
      Exploring {topic}
      {currentlyViewing !== topic && <small className="tertiary">, {currentlyViewing}</small>}
    </h3>
    <div className="row">

      {closest3Dict[currentlyViewing].map((relatedTopic) => <div className="col-md-4">
        <div className="shadowed-slim" style={{minHeight:"80vh", borderRadius:"15px", overflow:"hidden"}}>
          <img src={"data:image/jpg;base64, " + conceptsAsDict[relatedTopic].image} style={{width:"100%"}} />
          <div style={{padding:"5px", fontSize:"1.5em"}} className="text-center">{relatedTopic}</div>
          <p style={{padding:"10px", backgroundColor:"ligthgray", color:"black"}}>
            <i className="fa fa-2x fa-lightbulb" style={{color:"gold"}} />
            <small>
              {Object.keys(conceptsAsDict[relatedTopic].definition).map((key) => <div>
                {conceptsAsDict[relatedTopic].definition[key]}
              </div>)}
            </small>
          </p>
          <div className="text-center">
            <a onClick={() => setCurrentlyViewing(relatedTopic)} className="btn btn-secondary">
              <i className="fa fa-expand" /> Explore
            </a>
          </div>
        </div>
      </div>)}

    </div>



  </div>)
}

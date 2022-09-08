import React, {Suspense, useState} from 'react'
import GenateLearningDataService from '../../services/GenerateLearningDataService'
import {CohereHackathonExploreSubTopics} from './CohereHackathonExploreSubTopics'

// Remember to lazify this to reduce bundle size at a later date.

export default () => {

    const [topic, setTopic] = useState('')
    const [subtopicData, setSubtopicData] = useState([])
    const [errorHappened, setErrorHappened] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const getDataForTopic = () => {
        setSubmitted(true)
        setErrorHappened(false)
        GenateLearningDataService.getCohereData(topic).then((data) => {
            setSubtopicData(data.output)
        }).catch((e) => {
            console.error(e)
            console.log('Error occured getting cohere data...')
            setErrorHappened(e.toString())
        })
    }

    return (
        <div className="left-container" style={{marginLeft: "20%", marginRight: "20%", marginTop: "10px"}}>
            {(submitted === false) ?
                <div>
                    <h3 className="fit-to-panel">
                        Welcome to Learn-a-lot!
                    </h3>
                    <p>Enter the field/subject you want to dive into.</p>
                    <BasicInput value={topic} setValue={setTopic} placeholder="Psychology"/>
                    <a className="btn btn-secondary-with-bg btn-block" onClick={() => getDataForTopic()}>Start
                        Learning</a>
                    <div id="learningTopicIdeas" style={{marginTop:"40px"}}>
                        <span className="badge" style={{
                            color: "lightgray",
                            backgroundColor: "rgb(40,40,40)",
                            padding: "5px",
                            margin: "5px",
                            fontSize: "1em"
                        }}>🚀 Rockets</span>
                        <span className="badge" style={{
                            color: "lightgray",
                            backgroundColor: "rgb(40,40,40)",
                            padding: "5px",
                            margin: "5px",
                            fontSize: "1em"
                        }}>🧠 Psychology</span>
                        <span className="badge" style={{
                            color: "lightgray",
                            backgroundColor: "rgb(40,40,40)",
                            padding: "5px",
                            margin: "5px",
                            fontSize: "1em"
                        }}>🤖 Machine Learning</span>
                    </div>

                </div>
                : (subtopicData.length > 0) ?
                    <CohereHackathonExploreSubTopics topic={topic} subtopicData={subtopicData}/>
                    : (errorHappened) ? 'An error occured, sorry. It was: ' + errorHappened
                        : <LoadingDots/>
            }

        </div>)
}

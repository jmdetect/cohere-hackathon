import {Axios as axios} from "axios";

// TOUSE: Adjust this to your python backend running cohere/stable diffusion.
// our backend uses a job/microservices approach to do respectively
// a) Generate subtopics, b) Generate embeddings, c) Generate definitions, d) Get StableDiffusion images

const BACKEND_URL = 'localhost:3001';

export default class GenerateLearningDataService {

    static getCohereData(topic) {
        return new Promise((resolve, reject) =>
            axios.post(BACKEND_URL + '/getCohereData',
                {topic: topic})
                .then(resolve).catch(reject));
    }

}

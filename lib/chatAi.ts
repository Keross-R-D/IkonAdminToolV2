import axios from 'axios';
import { parseMarkdown } from './markdown';
import {v4 as uuidv4} from 'uuid';
import { MarkerType } from '@xyflow/react';
import { toast } from 'sonner';

async function postMessage(message: any, retryCallback:any) {
    try {

        const data = { 
            requirement: message,
        };

        const response = await axios.post('https://ikoncloud-dev.keross.com/aiagent/webhook/generateworkflow', data);
        
        const responseMessage = response.data.message;

        const parsedMessage = await parseMarkdown(responseMessage);
        console.log(parsedMessage);
        
        return {responseMessage,parsedMessage};
    } catch (error) {
        //console.error('Error posting message:', error);
        toast("Error posting message", {
            description: "Ai server unreacable. Try again later",
            // action: {
            //   label: "Try again",
            //   onClick: () => {if(retryCallback){retryCallback()}},
            // },
        })
    }
}

async function generateWorklow(workflowMsg: any,retryCallback:any) {
    try {
        const data = { 
            requirement: workflowMsg,
        };

        const response = await axios.post('https://ikoncloud-dev.keross.com/aiagent/webhook/generateworkflowv2', data);
        
        const responseMessage: {nodes: any[], edges: any[]} = response.data?.output || {nodes: [], edges: []};
        console.log(responseMessage);
        
        const nodeIdToTypeMap: { [key: string]: any } = {};
        responseMessage.nodes.forEach((e) => {
            nodeIdToTypeMap[e.id] = e.type.toLowerCase() 
        })

        responseMessage.nodes.forEach(node => {
            const id = `${node.type.toLowerCase()}_${node.id}`
            node.id = id;
            node.data.id = id;
        })

        responseMessage.edges = responseMessage.edges.map(edge => {
        
            const source = `${nodeIdToTypeMap[edge.source]}_${edge.source}`;
            const target = `${nodeIdToTypeMap[edge.target]}_${edge.target}`;

            const label = edge.label ? edge.label : 'transition'
            
            return {
                id: uuidv4(),
                label: label,
                source: source,
                target: target,
                animated: true,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20
                },
                type: "selfConnecting",
                style: {
                    strokeWidth: 2,
                },
            }
        })

        console.log(responseMessage);

        return responseMessage;
    } catch (error) {
        console.error('Error generating workflow', error);
        toast("Error generating workflow", {
            description: "Ai server unreacable. Try again later",
            // action: {
            //   label: "Try again",
            //   onClick: () => {if(retryCallback){retryCallback()}},
            // },
        })
    }
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

async function getLLMCompletion(messages: any[],retryCallback:any): Promise<any> {

    const apiUrl = 'https://ikoncloud-uat.keross.com/ikonopenui/api/chat/completions';
    const authKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZlYmU3YWQxLTM0ZTQtNGQwNi05Y2M5LTY0NWIxYmE5OThiZSJ9.yraBzDBQgF8AjGIuWJ6kc6vQUne1vHyQo_RaHhe9bWA';

    // Transform the Message array into the API's expected structure.
    const chatMessages: ChatMessage[] = messages.map((msg) => ({
        role: msg.user === 'bot' ? 'assistant' : 'user',
        content: msg.actualContent,
    }));

    try {
        const response = await axios.post(
            apiUrl, // dummy URL
            {   
                model: "process-model-workflow-gpt",
                messages: chatMessages 
            },
            {
                headers: {
                'Authorization': `Bearer ${authKey}`, // dummy auth key
                'Content-Type': 'application/json'
                },
            }
        );

        if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message || !response.data.choices[0].message.content) {
            throw new Error('Invalid response structure');
        }

        const responseMessage = response.data.choices[0].message.content

        const parsedMessage = await parseMarkdown(responseMessage);
        console.log(parsedMessage);
        
        return {responseMessage,parsedMessage};
        
    } catch (error) {
        console.error('Error fetching LLM completion:', error);
        throw error;
    }
}

export {
    postMessage,
    generateWorklow,
    getLLMCompletion
};
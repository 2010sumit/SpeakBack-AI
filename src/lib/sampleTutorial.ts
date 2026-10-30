import { SupportedLanguage, TutorialExplanation } from '@/types';

export const EXPRESS_SAMPLE_TRANSCRIPT = `Welcome to this quick tutorial on building your very first Node.js web server using Express.js.
First, make sure you have Node.js installed on your computer. Open your terminal and create a new directory for your project:
mkdir my-express-server
cd my-express-server

Next, initialize a new Node.js project by running:
npm init -y
This creates a package.json file with default settings to track our dependencies.

Now, install Express by typing:
npm install express
Express is a fast, unopinionated, minimalist web framework for Node.js that makes creating web APIs and servers easy.

Once Express is installed, create a new file named server.js:
Inside server.js, write the following code:
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});

Here, app.get defines a route handler for HTTP GET requests to the root path. app.listen binds and listens for connections on port 3000.

Finally, start your server by running:
node server.js

Open your web browser and navigate to http://localhost:3000. You will see "Hello World from Express!" displayed. If you encounter an 'Address already in use' error, make sure no other process is using port 3000.`;

export const PRESET_SAMPLE_EXPLANATIONS: Record<SupportedLanguage, TutorialExplanation> = {
  en: {
    title: 'Building a Simple Express.js Web Server in Node.js',
    summary:
      'This tutorial teaches how to initialize a Node.js project, install the Express framework, set up a basic HTTP GET route, and run a web server listening on port 3000.',
    beginnerExplanation:
      'Think of a web server as a receptionist at an office. When someone knocks on the front door (the root URL `/`), the receptionist responds with a friendly greeting ("Hello World from Express!"). Express is a lightweight tool for Node.js that helps us write this receptionist code in just a few lines without handling raw low-level networking.',
    importantConcepts: [
      {
        term: 'npm init -y',
        definition:
          'Initializes a new Node.js project and generates a `package.json` manifest with default values, without prompting you for each field.',
      },
      {
        term: 'Express.js',
        definition:
          'A popular, minimalist web application framework for Node.js that simplifies routing and HTTP request handling.',
      },
      {
        term: 'app.get(path, handler)',
        definition:
          'Configures an HTTP GET route. Whenever a client visits the specified path (like `/`), the callback function executes and sends a response.',
      },
      {
        term: 'app.listen(port, callback)',
        definition:
          'Tells your server to start listening for incoming network requests on a designated port number (e.g. 3000).',
      },
    ],
    actionChecklist: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Create project directory and navigate into it',
        description: 'Set up an isolated folder for your server files.',
        command: 'mkdir my-express-server && cd my-express-server',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Initialize Node.js package manifest',
        description: 'Creates `package.json` to manage project packages and metadata.',
        command: 'npm init -y',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Install Express library',
        description: 'Downloads express and records it in your `package.json` dependencies.',
        command: 'npm install express',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Create server.js file and add the starter code',
        description:
          'Create `server.js` and import express, define the root GET route, and listen on port 3000.',
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Start the Express server',
        description: 'Execute the server script with Node.',
        command: 'node server.js',
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'Verify in browser',
        description: 'Visit `http://localhost:3000` to see your "Hello World from Express!" message.',
      },
    ],
    quizQuestions: [
      {
        id: 'q-1',
        question: 'What is the primary role of the `npm init -y` command?',
        options: [
          'It runs the server in background mode',
          'It creates a package.json file with default configuration',
          'It installs Express automatically',
          'It creates server.js and populates sample routes',
        ],
        correctAnswerIndex: 1,
        explanation:
          '`npm init -y` automatically creates a default `package.json` file for your project without prompting you for input.',
      },
      {
        id: 'q-2',
        question: 'Which method starts the server and listens for incoming connections on a port?',
        options: [
          'app.connect()',
          'app.start()',
          'app.listen()',
          'app.serve()',
        ],
        correctAnswerIndex: 2,
        explanation:
          '`app.listen(port, callback)` is the standard Express method used to bind and listen on a given port.',
      },
      {
        id: 'q-3',
        question: 'What should you check if you receive an "Address already in use" error on port 3000?',
        options: [
          'Check if another application or earlier terminal process is already using port 3000',
          'Reinstall Node.js completely',
          'Delete package.json and re-run npm init',
          'Change the file name from server.js to index.js',
        ],
        correctAnswerIndex: 0,
        explanation:
          'Port conflicts happen when another process (like a previously started server) is already occupying that port number.',
      },
    ],
    troubleshootingTips: [
      'If you see "Cannot find module express", ensure you ran `npm install express` inside the project folder.',
      'If you see "EADDRINUSE: address already in use :::3000", terminate the existing process or change `PORT = 3001`.',
    ],
    sourceExcerpts: [
      'npm init -y: creates a package.json file with default settings to track our dependencies.',
      'app.listen(PORT, ...): binds and listens for connections on port 3000.',
    ],
    isDemoMode: true,
    demoMessage: 'Demo Mode (Offline Pre-computed Sample) — Showing curated source-grounded Express.js output.',
  },
  hi: {
    title: 'Node.js में Express.js के साथ पहला वेब सर्वर बनाना',
    summary:
      'यह ट्यूटोरियल सिखाता है कि कैसे एक Node.js प्रोजेक्ट शुरू करें, Express फ्रेमवर्क इंस्टॉल करें, एक बेसिक HTTP GET रूट सेट करें, और पोर्ट 3000 पर सर्वर चलाएं।',
    beginnerExplanation:
      'वेब सर्वर को एक ऑफिस के रिसेप्शनिस्ट की तरह समझें। जब कोई मुख्य दरवाजे (रूट URL `/`) पर आता है, तो रिसेप्शनिस्ट एक दोस्ताना संदेश ("Hello World from Express!") देता है। Express, Node.js के लिए एक हल्का टूल है जो हमें बिना किसी जटिल नेटवर्किंग कोड के कुछ ही लाइनों में ऐसा सर्वर बनाने में मदद करता है।',
    importantConcepts: [
      {
        term: 'npm init -y',
        definition:
          'एक नया Node.js प्रोजेक्ट शुरू करता है और डिफ़ॉल्ट सेटिंग्स के साथ `package.json` फ़ाइल बनाता है।',
      },
      {
        term: 'Express.js',
        definition:
          'Node.js के लिए एक लोकप्रिय और आसान वेब फ्रेमवर्क जो राउटिंग और सर्वर बनाना बहुत सरल बनाता है।',
      },
      {
        term: 'app.get(path, handler)',
        definition:
          'यह HTTP GET रूट परिभाषित करता है। जब भी कोई क्लाइंट दिए गए पाथ (जैसे `/`) पर जाता है, यह फ़ंक्शन चलता है और रिस्पॉन्स भेजता है।',
      },
      {
        term: 'app.listen(port, callback)',
        definition:
          'यह सर्वर को निर्दिष्ट पोर्ट (जैसे 3000) पर आने वाली रिक्वेस्ट सुनने और स्वीकार करने के लिए चालू करता है।',
      },
    ],
    actionChecklist: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'प्रोजेक्ट डायरेक्टरी बनाएं और उसमें जाएं',
        description: 'अपने सर्वर फ़ाइलों के लिए एक अलग फ़ोल्डर बनाएं।',
        command: 'mkdir my-express-server && cd my-express-server',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Node.js प्रोजेक्ट इनिशियलाइज़ करें',
        description: 'डिफ़ॉल्ट सेटिंग्स के साथ `package.json` बनाने के लिए चलाएं।',
        command: 'npm init -y',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Express लाइब्रेरी इंस्टॉल करें',
        description: 'Express को डाउनलोड करें और डिपेंडेंसी के रूप में सेव करें।',
        command: 'npm install express',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'server.js फ़ाइल बनाएं और कोड लिखें',
        description:
          '`server.js` बनाएं, Express इम्पोर्ट करें, रूट GET रूट जोड़ें और पोर्ट 3000 पर लिसन करें।',
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Express सर्वर चालू करें',
        description: 'Node.js के जरिए अपनी स्क्रिप्ट चलाएं।',
        command: 'node server.js',
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'ब्राउज़र में टेस्ट करें',
        description: 'ब्राउज़र में `http://localhost:3000` खोलें और "Hello World from Express!" संदेश देखें।',
      },
    ],
    quizQuestions: [
      {
        id: 'q-1',
        question: '`npm init -y` कमांड का मुख्य उद्देश्य क्या है?',
        options: [
          'सर्वर को बैकग्राउंड में चलाना',
          'डिफ़ॉल्ट सेटिंग्स के साथ package.json फ़ाइल बनाना',
          'Express को अपने आप इंस्टॉल करना',
          'server.js फ़ाइल बनाना',
        ],
        correctAnswerIndex: 1,
        explanation:
          '`npm init -y` कमांड डिफ़ॉल्ट मानों के साथ `package.json` फ़ाइल तुरंत तैयार कर देती है।',
      },
      {
        id: 'q-2',
        question: 'सर्वर को किसी पोर्ट पर शुरू और लिसन कराने के लिए कौन सा मेथड उपयोग होता है?',
        options: [
          'app.connect()',
          'app.start()',
          'app.listen()',
          'app.serve()',
        ],
        correctAnswerIndex: 2,
        explanation:
          '`app.listen(port, callback)` मेथड Express में सर्वर को शुरू करने के लिए उपयोग किया जाता है।',
      },
      {
        id: 'q-3',
        question: 'यदि आपको "Address already in use" एरर मिले, तो आपको क्या चेक करना चाहिए?',
        options: [
          'क्या कोई अन्य प्रोसेस पहले से पोर्ट 3000 का इस्तेमाल कर रहा है',
          'Node.js को दोबारा इंस्टॉल करें',
          'package.json को डिलीट करें',
          'server.js का नाम बदलें',
        ],
        correctAnswerIndex: 0,
        explanation:
          'पोर्ट कंफ्लिक्ट तब होता है जब कोई अन्य प्रोग्राम पहले से उस पोर्ट नंबर पर चल रहा हो।',
      },
    ],
    troubleshootingTips: [
      'अगर "Cannot find module express" दिखे, तो सुनिश्चित करें कि आपने फ़ोल्डर में `npm install express` चलाया है।',
      'अगर पोर्ट 3000 पहले से व्यस्त है, तो `PORT = 3001` कर के दोबारा प्रयास करें।',
    ],
    sourceExcerpts: [
      'npm init -y: This creates a package.json file with default settings to track our dependencies.',
      'app.listen(PORT, ...): binds and listens for connections on port 3000.',
    ],
    isDemoMode: true,
    demoMessage: 'डेमो मोड (सैंपल डेटा) — ट्यूटोरियल स्रोत पर आधारित प्रमाणित हिंदी विवरण।',
  },
  pa: {
    title: 'Node.js ਵਿੱਚ Express.js ਨਾਲ ਪਹਿਲਾ ਵੈੱਬ ਸਰਵਰ ਬਣਾਉਣਾ',
    summary:
      'ਇਹ ਟਿਊਟੋਰੀਅਲ ਸਿਖਾਉਂਦਾ ਹੈ ਕਿ ਕਿਵੇਂ ਇੱਕ Node.js ਪ੍ਰੋਜੈਕਟ ਸ਼ੁਰੂ ਕਰਨਾ ਹੈ, Express ਫਰੇਮਵਰਕ ਇੰਸਟਾਲ ਕਰਨਾ ਹੈ, ਇੱਕ ਬੁਨਿਆਦੀ HTTP GET ਰੂਟ ਬਣਾਉਣਾ ਹੈ, ਅਤੇ ਪੋਰਟ 3000 ਤੇ ਸਰਵਰ ਚਲਾਉਣਾ ਹੈ।',
    beginnerExplanation:
      'ਵੈੱਬ ਸਰਵਰ ਨੂੰ ਦਫ਼ਤਰ ਦੇ ਇੱਕ ਰਿਸੈਪਸ਼ਨਿਸਟ ਵਾਂਗ ਸਮਝੋ। ਜਦੋਂ ਕੋਈ ਮੁੱਖ ਦਰਵਾਜ਼ੇ (ਰੂਟ URL `/`) ਤੇ ਆਉਂਦਾ ਹੈ, ਤਾਂ ਰਿਸੈਪਸ਼ਨਿਸਟ ਇੱਕ ਸੁਨੇਹਾ ("Hello World from Express!") ਭੇਜਦਾ ਹੈ। Express, Node.js ਲਈ ਇੱਕ ਹਲਕਾ ਟੂਲ ਹੈ ਜੋ ਸਾਨੂੰ ਬਿਨਾਂ ਕਿਸੇ ਔਖੇ ਨੈੱਟਵਰਕਿੰਗ ਕੋਡ ਦੇ ਕੁਝ ਲਾਈਨਾਂ ਵਿੱਚ ਸਰਵਰ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
    importantConcepts: [
      {
        term: 'npm init -y',
        definition:
          'ਇੱਕ ਨਵਾਂ Node.js ਪ੍ਰੋਜੈਕਟ ਸ਼ੁਰੂ ਕਰਦਾ ਹੈ ਅਤੇ ਡਿਫੌਲਟ ਸੈਟਿੰਗਾਂ ਨਾਲ `package.json` ਫਾਈਲ ਤਿਆਰ ਕਰਦਾ ਹੈ।',
      },
      {
        term: 'Express.js',
        definition:
          'Node.js ਲਈ ਇੱਕ ਮਸ਼ਹੂਰ ਅਤੇ ਸੌਖਾ ਵੈੱਬ ਫਰੇਮਵਰਕ ਜੋ ਰੂਟਿੰਗ ਅਤੇ ਸਰਵਰ ਬਣਾਉਣ ਨੂੰ ਆਸਾਨ ਬਣਾਉਂਦਾ ਹੈ।',
      },
      {
        term: 'app.get(path, handler)',
        definition:
          'ਇਹ HTTP GET ਰੂਟ ਬਣਾਉਂਦਾ ਹੈ। ਜਦੋਂ ਕੋਈ ਵਰਤੋਂਕਾਰ ਦਿੱਤੇ ਗਏ ਪਾਥ (ਜਿਵੇਂ `/`) ਤੇ ਜਾਂਦਾ ਹੈ, ਇਹ ਫੰਕਸ਼ਨ ਜਵਾਬ ਭੇਜਦਾ ਹੈ।',
      },
      {
        term: 'app.listen(port, callback)',
        definition:
          'ਇਹ ਸਰਵਰ ਨੂੰ ਦਿੱਤੇ ਗਏ ਪੋਰਟ (ਜਿਵੇਂ 3000) ਤੇ ਨੈੱਟਵਰਕ ਰਿਕਵੈਸਟਾਂ ਸੁਣਨ ਲਈ ਚਾਲੂ ਕਰਦਾ ਹੈ।',
      },
    ],
    actionChecklist: [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'ਪ੍ਰੋਜੈਕਟ ਫੋਲਡਰ ਬਣਾਓ ਅਤੇ ਉਸ ਵਿੱਚ ਜਾਓ',
        description: 'ਆਪਣੀਆਂ ਸਰਵਰ ਫਾਈਲਾਂ ਲਈ ਇੱਕ ਵੱਖਰਾ ਫੋਲਡਰ ਬਣਾਓ।',
        command: 'mkdir my-express-server && cd my-express-server',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Node.js ਪ੍ਰੋਜੈਕਟ ਸ਼ੁਰੂ ਕਰੋ',
        description: 'ਡਿਫੌਲਟ ਸੈਟਿੰਗਾਂ ਨਾਲ `package.json` ਬਣਾਉਣ ਲਈ ਚਲਾਓ।',
        command: 'npm init -y',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Express ਲਾਇਬ੍ਰੇਰੀ ਇੰਸਟਾਲ ਕਰੋ',
        description: 'Express ਡਾਊਨਲੋਡ ਕਰੋ ਅਤੇ ਡਿਪੈਂਡੈਂਸੀ ਵਜੋਂ ਸੁਰੱਖਿਅਤ ਕਰੋ।',
        command: 'npm install express',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'server.js ਫਾਈਲ ਬਣਾਓ ਅਤੇ ਕੋਡ ਲਿਖੋ',
        description:
          '`server.js` ਬਣਾਓ, Express ਇੰਪੋਰਟ ਕਰੋ, ਰੂਟ GET ਰੂਟ ਸ਼ਾਮਲ ਕਰੋ ਅਤੇ ਪੋਰਟ 3000 ਤੇ ਲਿਸਨ ਕਰੋ।',
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Express ਸਰਵਰ ਚਾਲੂ ਕਰੋ',
        description: 'Node.js ਦੀ ਮਦਦ ਨਾਲ ਆਪਣੀ ਸਕ੍ਰਿਪਟ ਚਲਾਓ।',
        command: 'node server.js',
      },
      {
        id: 'step-6',
        stepNumber: 6,
        title: 'ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਚੈੱਕ ਕਰੋ',
        description: 'ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ `http://localhost:3000` ਖੋਲ੍ਹੋ ਅਤੇ ਸੁਨੇਹਾ ਦੇਖੋ।',
      },
    ],
    quizQuestions: [
      {
        id: 'q-1',
        question: '`npm init -y` ਕਮਾਂਡ ਦਾ ਮੁੱਖ ਕੰਮ ਕੀ ਹੈ?',
        options: [
          'ਸਰਵਰ ਨੂੰ ਚਲਾਉਣਾ',
          'ਡਿਫੌਲਟ ਸੈਟਿੰਗਾਂ ਨਾਲ package.json ਫਾਈਲ ਬਣਾਉਣਾ',
          'Express ਇੰਸਟਾਲ ਕਰਨਾ',
          'server.js ਫਾਈਲ ਬਣਾਉਣਾ',
        ],
        correctAnswerIndex: 1,
        explanation:
          '`npm init -y` ਕਮਾਂਡ ਪ੍ਰੋਜੈਕਟ ਲਈ ਤੁਰੰਤ ਡਿਫੌਲਟ `package.json` ਫਾਈਲ ਤਿਆਰ ਕਰਦੀ ਹੈ।',
      },
      {
        id: 'q-2',
        question: 'ਸਰਵਰ ਨੂੰ ਕਿਸੇ ਪੋਰਟ ਤੇ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕਿਹੜਾ ਮੈਥਡ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ?',
        options: [
          'app.connect()',
          'app.start()',
          'app.listen()',
          'app.serve()',
        ],
        correctAnswerIndex: 2,
        explanation:
          '`app.listen(port, callback)` ਮੈਥਡ Express ਵਿੱਚ ਸਰਵਰ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ।',
      },
      {
        id: 'q-3',
        question: 'ਜੇਕਰ "Address already in use" ਗਲਤੀ ਆਉਂਦੀ ਹੈ, ਤਾਂ ਕੀ ਚੈੱਕ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?',
        options: [
          'ਕੀ ਕੋਈ ਹੋਰ ਪ੍ਰੋਗਰਾਮ ਪਹਿਲਾਂ ਤੋਂ ਪੋਰਟ 3000 ਵਰਤ ਰਿਹਾ ਹੈ',
          'Node.js ਦੁਬਾਰਾ ਇੰਸਟਾਲ ਕਰੋ',
          'package.json ਡਿਲੀਟ ਕਰੋ',
          'server.js ਦਾ ਨਾਮ ਬਦਲੋ',
        ],
        correctAnswerIndex: 0,
        explanation:
          'ਪੋਰਟ ਸਮੱਸਿਆ ਉਦੋਂ ਆਉਂਦੀ ਹੈ ਜਦੋਂ ਕੋਈ ਹੋਰ ਪ੍ਰੋਸੈਸ ਪਹਿਲਾਂ ਹੀ ਉਸ ਪੋਰਟ ਨੰਬਰ ਨੂੰ ਵਰਤ ਰਿਹਾ ਹੋਵੇ।',
      },
    ],
    troubleshootingTips: [
      'ਜੇ "Cannot find module express" ਦਿਖੇ, ਤਾਂ ਪੁਸ਼ਟੀ ਕਰੋ ਕਿ ਤੁਸੀਂ ਫੋਲਡਰ ਵਿੱਚ `npm install express` ਚਲਾਇਆ ਹੈ।',
      'ਜੇ ਪੋਰਟ 3000 ਪਹਿਲਾਂ ਤੋਂ ਵਰਤੀ ਜਾ ਰਹੀ ਹੈ, ਤਾਂ ਕੋਡ ਵਿੱਚ `PORT = 3001` ਕਰਕੇ ਦੁਬਾਰਾ ਚਲਾਓ।',
    ],
    sourceExcerpts: [
      'npm init -y: creates a package.json file with default settings to track our dependencies.',
      'app.listen(PORT, ...): binds and listens for connections on port 3000.',
    ],
    isDemoMode: true,
    demoMessage: 'ਡੈਮੋ ਮੋਡ (ਸੈਂਪਲ ਡਾਟਾ) — ਸਰੋਤ ਉੱਤੇ ਆਧਾਰਿਤ ਪ੍ਰਮਾਣਿਤ ਪੰਜਾਬੀ ਵਿਆਖਿਆ।',
  },
};

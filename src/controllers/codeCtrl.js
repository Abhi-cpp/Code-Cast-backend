const axios = require('axios')

const url = process.env.CODE_EXECUTION_URL;
//! #better shift to doogle or jude0 api for more languages.
/** 
 Java	java
Python	py
C++	cpp
C	c
GoLang	go
C#	cs
NodeJS	js
***/
// map each language with it's short name

const languageMap = {
    java: "java",
    python: "py",
    c_cpp: "cpp",
    golang: "go",
    csharp: "cs",
    nodejs: "js",
    javascript: "js"
};

async function execute(req, res) {
    try {
        let { code, language } = req.body;
        const input = req.body.input || "";
        language = languageMap[language];
        const data = {
            code,
            language,
            input,
        };
        const response = await axios.post(url, data);
        return res.status(200).send(response.data);
    } catch (error) {
        console.log('error in code execute');
        return res.status(500).send({ error: error });
    }
}
module.exports = { execute };
addEventListener('fetch', event => {
  const request = event.request;
  if (request.method.toUpperCase() === "OPTIONS") {
    // 处理预检请求
    event.respondWith(handleOptions(request));
  } else {
    // 处理常规请求
    event.respondWith(handleRequest(request));
  }
});

// 处理常规请求
async function handleRequest(request) {
  // 从环境变量中获取API密码（作为Token使用）
  const apiToken = API_PASSWORD; // Cloudflare Worker中直接使用环境变量名

  // 如果API_TOKEN存在且非空，则进行Token验证
  if (apiToken) {
    // 获取请求头中的Authorization字段
    const authHeader = request.headers.get('Authorization');
    
    // 检查Authorization头是否存在且格式正确
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 提取Token并验证
    const token = authHeader.split(' ')[1];
    if (token !== apiToken) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const url = new URL(request.url);

  let response;
  switch (url.pathname) {
    case '/upload/58img':
      response = await handle58imgRequest(request);
      break;
    case '/upload/aagmoe':
      response = await handleaagmoeRequest(request);
      break;
    case '/upload/10086':
      response = await  handle10086Request(request);
      break;
    case '/upload/tencent':
      response = await  handleTencentRequest(request);
      break;
    case '/upload/qst8':
      response = await  handleQst8Request(request);
      break;
    case '/upload/vviptuangou':
      response = await  handleVviptuangouRequest(request);
      break;
    case '/upload/da8m':
      response = await  handleDa8mRequest(request);
      break;
    case '/upload/ipfs':
      response = await  handleimg2ipfsRequest(request);
      break;
    case '/upload/tgphimg':
      response = await  handleTgphimgRequest(request);
      break;
    case '/upload/aliex':
      response = await  handleAliExpressRequest(request);
      break;
    case '/upload/jdkf':
      response = await handlejdkfRequest(request);
      break;
    case '/upload/mtdp':
      response = await handleMtDpRequest(request);
      break;
    default:
      response = new Response('Not Found', { status: 404 });
      break;
  }

  // 添加 CORS 头到响应中
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
  
  // 处理预检请求
  function handleOptions(request) {
    // 确保预检请求的访问控制请求头在允许的范围内
    let headers = request.headers;
    if (headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null) {
      // 处理 CORS 预检请求
      let respHeaders = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': headers.get('Access-Control-Request-Headers'),
        'Access-Control-Max-Age': '86400', // 1 day
      });
  
      return new Response(null, { headers: respHeaders });
    } else {
      // 处理非预检请求
      return new Response(null, {
        headers: {
          'Allow': 'GET, POST, OPTIONS',
        },
      });
    }
  }

  async function handle58imgRequest(request) {
    // 确认请求方法为 POST 并且内容类型正确
    if (request.method !== 'POST' || !request.headers.get('Content-Type').includes('multipart/form-data')) {
      return new Response('Invalid request', { status: 400 });
    }
  
    // 解析表单数据
    const formData = await request.formData();
    const imageFile = formData.get('image'); // 假设字段名为 'image'
    if (!imageFile) return new Response('Image file not found', { status: 400 });
  
    // 将文件数据转换为 ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();
  
    // 将 ArrayBuffer 转换为 Base64
    const base64EncodedData = bufferToBase64(arrayBuffer);
  
    // 构建请求负载
    const payload = {
      "Pic-Size": "0*0",
      "Pic-Encoding": "base64",
      "Pic-Path": "/nowater/webim/big/",
      "Pic-Data": base64EncodedData
    };
  
    // 目标URL
    const targetUrl = "https://upload.58cdn.com.cn/json/nowater/webim/big/";
  
    // 发送POST请求
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  
    // 处理响应
    if (response.ok) {
      const result = await response.text();
      // 随机生成1到8之间的数字
      const random_number = Math.floor(Math.random() * 8) + 1;
      const finalUrl = `https://pic${random_number}.58cdn.com.cn/nowater/webim/big/${result}`;
      return new Response(finalUrl);
    } else {
      return new Response("Error: " + await response.text(), { status: response.status });
    }
  }

  // 复制自 API_IMG_58img.js 的辅助函数
  function bufferToBase64(buf) {
    var binary = '';
    var bytes = new Uint8Array(buf);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    // 使用 btoa 进行 Base64 编码
    return btoa(binary);
  } 
  
  async function handleTencentRequest(request) {
    try {
      // 确保请求方法为 POST
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
  
      // 解析multipart/form-data
      const formData = await request.formData();
      const imageFile = formData.get('image'); // 假设前端发送的字段名是 'image'
      if (!imageFile) {
        return new Response('No image file found in the request', { status: 400 });
      }
  
      // 准备发送到腾讯接口的FormData
      const uploadFormData = new FormData();
      uploadFormData.append('media', imageFile, imageFile.name);
  
      // 腾讯的上传URL
      const uploadUrl = "https://openai.weixin.qq.com/weixinh5/webapp/h774yvzC2xlB4bIgGfX2stc4kvC85J/cos/upload";
  
      // 发送请求到腾讯接口
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: uploadFormData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.url) {
        // 如果成功，返回图片URL
        return new Response(result.url, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        // 如果没有返回URL，则可能上传失败
        return new Response('Upload failed: No URL returned', { status: 500 });
      }
  
    } catch (error) {
      console.error('Error in handleTencentRequest:', error);
      return new Response(`Upload failed: ${error.message}`, { status: 500 });
    }
  }
  

  async function handleVviptuangouRequest(request) {
    console.log('Request received:', request.url);
  
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const formData = await request.formData();
      const file = formData.get('image'); // 使用 'image' 字段名
      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }
  
      const newFormData = new FormData();
      newFormData.append('file', file, file.name); // 上传到目标服务器时使用 'file'
  
      const targetUrl = 'https://api.vviptuangou.com/api/upload';
  
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: newFormData,
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
          'Branchid': '1002',
          'Cache-Control': 'no-cache',
          'DNT': '1',
          'Origin': 'https://mlw10086.serv00.net',
          'Pragma': 'no-cache',
          'Priority': 'u=1, i',
          'Referer': 'https://mlw10086.serv00.net/',
          'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'Sign': 'e346dedcb06bace9cd7ccc6688dd7ca1', // 替换为动态生成的sign值
          'Source': 'h5',
          'Tenantid': '3',
          'Timestamp': '1725792862411', // 替换为动态生成的timestamp值
          'Token': 'b3bc3a220db6317d4a08284c6119d136', // 请替换成有效的 token
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        }
      });
  
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);
  
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.status === 1 && jsonResponse.imgurl) {
          // 根据 imgurl 构建正确的图片链接
          const correctImageUrl = `https://assets.vviptuangou.com/${jsonResponse.imgurl}`;
          return new Response(correctImageUrl, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
  
      return new Response(responseText, {
        status: response.status,
        headers: response.headers
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async function handleDa8mRequest(request) {
    console.log('Request received:', request.url);
  
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      const formData = await request.formData();
      const file = formData.get('image'); // 使用 'image' 字段名
      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }
  
      const newFormData = new FormData();
      newFormData.append('file', file, file.name); // 上传到目标服务器时使用 'file'
  
      const targetUrl = 'https://api.da8m.cn/api/upload';
  
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: newFormData,
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
          'Branchid': '1002',
          'Cache-Control': 'no-cache',
          'DNT': '1',
          'Origin': 'https://mlw10086.serv00.net',
          'Pragma': 'no-cache',
          'Priority': 'u=1, i',
          'Referer': 'https://mlw10086.serv00.net/',
          'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'Sign': 'e346dedcb06bace9cd7ccc6688dd7ca1', // 替换为动态生成的sign值
          'Source': 'h5',
          'Tenantid': '3',
          'Timestamp': '1725792862411', // 替换为动态生成的timestamp值
          'Token': '4ca04a3ff8ca3b8f0f8cfa01899ddf8e', // 请替换成有效的 token
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        }
      });
  
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);
  
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.status === 1 && jsonResponse.imgurl) {
          // 根据 imgurl 构建正确的图片链接
          const correctImageUrl = `https://assets.da8m.cn/${jsonResponse.imgurl}`;
          return new Response(correctImageUrl, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
  
      return new Response(responseText, {
        status: response.status,
        headers: response.headers
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  
  async function handleimg2ipfsRequest(request) {
    console.log('Request received:', request.url);
  
    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
  
    try {
      // 解析表单数据
      const formData = await request.formData();
      const file = formData.get('image'); // 使用 'image' 字段名
      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }
  
      // 准备新的 FormData 发送到 IPFS 网关
      const newFormData = new FormData();
      newFormData.append('file', file, file.name);
  
      // IPFS 网关上传 URL
      const ipfsUrl = 'https://api.img2ipfs.org/api/v0/add?pin=false';
  
      // 使用 fetch API 发送文件到 IPFS 网关
      const response = await fetch(ipfsUrl, {
        method: 'POST',
        body: newFormData,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        }
      });
  
      // 检查请求状态
      if (response.ok) {
        const result = await response.json();
        console.log("上传成功！");
  
        // 从返回结果中提取哈希值和文件名
        const fileName = result.Name;
        const fileHash = result.Hash;
        const fileSize = result.Size;
        
        console.log(`文件名: ${fileName}`);
        console.log(`哈希值: ${fileHash}`);
        console.log(`大小: ${fileSize} 字节`);
  
        // 构建图片访问链接
        //const accessUrl = `https://cdn.img2ipfs.com/ipfs/${fileHash}?filename=${fileName}`;
        const accessUrl = `https://i0.wp.com/i0.img2ipfs.com/ipfs/${fileHash}`;
        console.log(`图片访问链接: ${accessUrl}`);
  
        // 返回成功的链接
        return new Response(accessUrl, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        console.error(`上传失败，状态码: ${response.status}`);
        return new Response(`Upload failed with status: ${response.status}`, { status: response.status });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  

  async function handleTgphimgRequest(request) {
    // 确认请求方法为 POST 并且内容类型正确
    if (request.method !== 'POST' || !request.headers.get('Content-Type').includes('multipart/form-data')) {
      return new Response('Invalid request', { status: 400 });
    }
  
    // 解析表单数据
    const formData = await request.formData();
    const imageFile = formData.get('image'); // 假设字段名为 'image'
    if (!imageFile) return new Response('Image file not found', { status: 400 });
  
    // 修改字段名为 'file'，以适应 Telegra.ph 的接口
    formData.append('file', imageFile);
    formData.delete('image'); // 删除原来的 'image' 字段
  
    // Telegra.ph 的上传接口
    const targetUrl = 'https://telegra.ph/upload?source=bugtracker';
  
    // 发送修改后的表单数据
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData
    });
  
    // 处理响应
    if (response.ok) {
      const result = await response.json();
      if (result && result.src) {
        // 提取 src 并拼接成完整的 URL
        const imageUrl = `https://telegra.ph${result.src.replace(/\\/g, '')}`; // 处理反斜杠
        return new Response(imageUrl);
      } else {
        return new Response('Error: Unexpected response format', { status: 500 });
      }
    } else {
      return new Response('Error: ' + await response.text(), { status: response.status });
    }
  }


  async function handleAliExpressRequest(request) {
    try {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', {
          status: 405,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
  
      const formData = await request.formData();
      const imageFile = formData.get('image');
      if (!imageFile) {
        return new Response('No image file found in the request', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
  
      // 从 KV 中获取 Cookie
      const cookie = await WORKER_IMGBED.get('ali_express_cookie');
      if (!cookie) {
        console.error('Missing required cookie in KV storage');
        return new Response('Missing required cookie in KV storage', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
  
      console.log(`Retrieved Cookie from KV: ${cookie}`);
  
      // 构建上传表单数据
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile, imageFile.name);
      uploadFormData.append('bizCode', 'ae_profile_avatar_upload');
  
      const uploadUrl = 'https://filebroker.aliexpress.com/x/upload?jiketuchuang=1';
  
      // 发送 POST 请求到 AliExpress API
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Origin': 'https://filebroker.aliexpress.com',
          'Cookie': cookie, // 使用 KV 中的 Cookie
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed: Status ${response.status}, Body: ${errorText}`);
        return new Response(`Upload failed: HTTP error! Status: ${response.status}`, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
  
      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (parseError) {
        console.error(`Error parsing response: ${parseError.message}, Response Text: ${resultText}`);
        return new Response(`Upload failed: Error parsing response - ${parseError.message}`, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
  
      if (result.url) {
        console.log(`Upload successful: ${result.url}`);
        return new Response(result.url, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        console.error(`Upload failed: No URL returned, Response: ${resultText}`);
        return new Response('Upload failed: No URL returned', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (error) {
      console.error(`Error in handleAliExpressRequest: ${error.stack}`);
      return new Response(`Upload failed: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
  
  async function handlejdkfRequest(request) {
    console.log('Request received for jdkf upload:', request.url);
  
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
  
    try {
      // 解析请求中的表单数据
      const formData = await request.formData();
      const file = formData.get('image'); // 前端上传的字段名为 'image'
  
      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }
  
      // 创建新的 FormData，用于发送到目标接口
      const newFormData = new FormData();
      newFormData.append('files', file, file.name); // 目标接口要求字段名为 'files'
  
      // 设置目标接口所需的头部信息
      const targetHeaders = {
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Priority': 'u=1, i',
        'Sec-CH-UA': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'none',
        'X-Requested-With': 'XMLHttpRequest'
      };
  
      // 目标上传接口的 URL
      const targetUrl = 'https://kefu-jtalk.jd.com/jtalk/hfive/resource/image/upload';
  
      // 发送请求到目标接口
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: targetHeaders,
        body: newFormData
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed: Status ${response.status}, Body: ${errorText}`);
        return new Response(`Upload failed: ${errorText}`, { status: response.status });
      }
  
      // 解析目标接口的响应
      const responseData = await response.json();
      console.log('Response from jdkf API:', responseData);
  
      // 从响应中提取图片 URL
      const uploadUrl = responseData?.data?.[0]?.url;
  
      if (uploadUrl) {
        // 成功，返回图片 URL
        return new Response(uploadUrl, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*' // 根据需要调整 CORS 策略
          }
        });
      } else {
        console.error('URL not found in response:', responseData);
        return new Response('Upload succeeded but no URL returned', { status: 500 });
      }
    } catch (error) {
      console.error('Error in handleJdkfRequest:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  

  async function handleMtDpRequest(request) {
    console.log('Request received for DP upload:', request.url);
  
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
  
    try {
      // 解析请求中的表单数据
      const formData = await request.formData();
      const file = formData.get('image'); // 前端上传的字段名为 'image'
  
      if (!file) {
        return new Response('No file uploaded', { status: 400 });
      }
  
      // 获取文件信息
      const fileName = file.name;
      const fileType = file.type; // 如 'image/jpeg'
      const fileSize = file.size;
  
      // 生成新的文件名（使用 MD5 和随机数）
      const timeStamp = new Date().getTime().toString();
      const randomNum = Math.floor(Math.random() * 100000).toString();
      const hash = await crypto.subtle.digest('MD5', new TextEncoder().encode(timeStamp + randomNum));
      const hashArray = Array.from(new Uint8Array(hash));
      const md5Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const newFileName = md5Hash + '.' + fileName.split('.').pop();
  
      // 获取文件的最后修改时间（GMT 格式）
      const lastModifiedDate = new Date().toUTCString();
  
      // 创建新的 FormData，用于发送到大众点评的接口
      const dpFormData = new FormData();
      dpFormData.append('id', 'WU_FILE_0'); // 固定值
      dpFormData.append('name', newFileName);
      dpFormData.append('type', fileType);
      dpFormData.append('lastModifiedDate', lastModifiedDate);
      dpFormData.append('size', fileSize);
      dpFormData.append('file', file, newFileName); // 文件字段名为 'file'
  
      // 设置必要的头部信息
      const dpHeaders = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
  
      // 大众点评的上传接口 URL
      const dpUrl = 'https://trust.dianping.com/upload.action';
  
      // 发送请求到大众点评接口
      const response = await fetch(dpUrl, {
        method: 'POST',
        headers: dpHeaders,
        body: dpFormData
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed: Status ${response.status}, Body: ${errorText}`);
        return new Response(`Upload failed: ${errorText}`, { status: response.status });
      }
  
      // 解析大众点评接口的响应
      const responseData = await response.json();
      console.log('Response from DP API:', responseData);
  
      if (responseData && responseData.isSuccess) {
        let url = responseData.url;
  
        // 转为 HTTPS 协议
        url = url.replace('http://', 'https://');
  
        // 随机替换域名前缀
        const prefixes = ['img', 'p0', 'p1', 'p2'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        url = url.replace(/\/\/p0\./, `//${randomPrefix}.`);
  
        // 成功，返回图片 URL
        return new Response(url, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*' // 根据需要调整 CORS 策略
          }
        });
      } else {
        console.error('Upload failed:', responseData);
        return new Response('Upload failed', { status: 500 });
      }
    } catch (error) {
      console.error('Error in handleDpUploadRequest:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  
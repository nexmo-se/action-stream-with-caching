# Voice API - Audio file access caching when streaming an audio file from an API request or an NCCO action stream

## What this application does

This application acts as a Voice API server application and just for testing purposes as a web file server of audio files too.

When calling the linked phone number, the Voice API server application requests accessing and downloading the audio file with
the corresponding [REST API request](https://developer.vonage.com/en/api/voice#Stream-Audio) or the corresponding [NCCO action](https://developer.vonage.com/en/voice/voice-api/ncco-reference#stream),<br>
the audio file gets accessed/downloaded on the first request, then not accessed the few subsequent times because of the caching as set in the file server part of this reference code.

## Set up

### Local deployment - Set up part 1 - Internet tunneling service - ngrok

If you plan to test using `Local deployment with ngrok` (Internet tunneling service), here are the instructions to set up ngrok:<br>
- [Install ngrok](https://ngrok.com/download)<br>
- Make sure you are using the latest version of ngrok and not using a previously installed version of ngrok
- Sign up for a free [ngrok account](https://dashboard.ngrok.com/signup)<br>
- Verify your email address from the email sent by ngrok<br>
- Retrieve [your Authoken](https://dashboard.ngrok.com/get-started/your-authtoken)<br>
- Run the command `ngrok config add-authtoken <your-authtoken>`<br>
- Set up the tunnel
	- Run `ngrok config edit`
		- For a free ngrok account, add following lines to the ngrok configuration file (under authoken line):</br>
		<pre><code>	
		tunnels:
			mytunnel:</br>
				proto: http</br>
				addr: 8000</br>
		</code></pre>
		- For a [paid ngrok account](https://dashboard.ngrok.com/billing/subscription), you may set a ngrok hostname that never changes on each ngrok new launch, add following lines to the ngrok configuration file (under authoken line) - set hostname to actual desired value:</br>
		<pre><code>	
		tunnels:
			mytunnel:</br>
				proto: http</br>
				addr: 8000</br>
				hostname: setahostnamehere.ngrok.io</br>
		</code></pre>			
		
- Start the ngrok tunnel
	- Run `ngrok start mytunnel`</br>
	- You will see lines like
		....</br>
		*Web Interface                 http://127.0.0.1:4040</br>                             
		Forwarding                    https://xxxxxx.ngrok.xxx -> http://localhost:8000*</br> 
	- Make note of *https://xxxxxx.ngrok.xxx* (with the leading https://), as it will be needed in the next steps below.</br>	

This Node.js server application (this repository) is running on local port 8000.</br>

### Local deployment - Set up part 2 - Vonage Voice API application credentials and other parameters

[Log in to your](https://dashboard.nexmo.com/sign-in) or [sign up for a](https://ui.idp.vonage.com/ui/auth/registration) Vonage APIs account.
 
Go to [Your applications](https://dashboard.nexmo.com/applications), access an existing application or [+ Create a new application](https://dashboard.nexmo.com/applications/new).

Under Capabilities section (click on [Edit] if you do not see this section):

**Enable** Voice
- Under Answer URL, **select** HTTP POST, and enter</br>
https://\<host\>:\<port\>/answer</br>
(replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
- Under Event URL, **select** HTTP POST, and enter</br>
https://\<host\>:\<port\>/event</br>
(replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
Note: If you are using ngrok for this sample application, the answer URL and event URL look like:</br>
https://yyyyyyyy.ngrok.xxx/answer</br>
https://yyyyyyyy.ngrok.xxx/event</br></br>
- If you turn on call recording (see .env-example file content), you need to enable RTC webhooks</br>
under RTC, **select** HTTP POST, and enter</br>
https://\<host\>:\<port\>/rtc</br>
(replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>

- Click on [Generate public and private key] if you did not yet create or want new ones, save the private key file in this application folder as .private.key (leading dot in the file name).</br>

- Click on [Generate new application] if you've just created the application.</br></br>

**IMPORTANT**: If you already have an existing application and just changed some parameter values including created a new public and private key set, do not forget to click on [Save changes] at the bottom of the screen.</br></br>

Please take note of your **application ID** and **linked phone number** (if any), as they are needed in the *Deployment* section.

For the next steps, you will need:</br>
- Your [Vonage API key](https://dashboard.nexmo.com/settings) (as **`API_KEY`**)</br>
- Your [Vonage API secret](https://dashboard.nexmo.com/settings), not signature secret, (as **`API_SECRET`**)</br>
- Your `application ID` (as **`APP_ID`**),</br>

### Local deployment - Set up part 3 - Deployment

Have Node.js installed on your system, this application has been tested with Node.js version 22.16<br>

Have this repository files copied into a folder of your server, go to that folder.<br>

Copy or rename .env-example to .env<br>
Update parameters in .env file<br>

Install node modules with the command:<br>
 ```bash
npm install
```

Launch the server application with the following command:<br>
```bash
node action-stream
```
Default local (not public!) `port` of this server application is: 8000.

If you run this application locally on your computer, you may use ngrok and establish an https tunnel to local port 8000.

## How to use this application

Call in to the phone number linked to this application, the caller will hear the audio from the accessed audio file.<br>

You will see that the file is accessed once on the first access request, and not accessed for the few subsequent times as caching is being enabled by the file server by setting the relevant HTTP headers content when serving the requested file,<br>
see https://github.com/nexmo-se/action-stream-with-caching/blob/master/action-stream.js#L105-L106



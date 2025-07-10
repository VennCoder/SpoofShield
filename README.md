# SpoofShield- ## Deep-Learning Based Email Spoofing Detection for Modern Email Systems

SpoofShield is a Chrome extension that detects spoofed emails in real-time directly within Gmail. Powered by a local AI model, it analyzes email content to classify whether a message is legit or a potential spoof. The extension runs seamlessly in the background, overlays results next to email subjects, and maintains a session-based history of scanned emails — all without uploading your emails to the cloud.

## Setup Instructions:

1.Download the 2 folders: Backend and Frontend,and store them in the same directory.

2.Backend > saved_model > model.safetensors could not be uploaded to GitHub due to the large size so it requires additional download.It can be downloaded from the Google Drive link provided in the model.safetensors.txt file.


## How to Use:

1.In Command Prompt,navigate to the Backend Folder and proceed to run app.py to start the Flask API.

2.Next,open Google Chrome and navigate to Settings > Extensions. Toggle the "Developer Mode" switch on the top right side of the screen.

3.Now,on the top left side of the screen,click Load Unpacked.

4.Browse and navigate to the Frontend folder and select it.The extension is now loaded to your browser.

5.Open the extension and click the 'Start Session' button to start.

6.Open Gmail in a new tab and open any email.The extension will automatically scan the email in the background and display the result in the subject line of the email. You can also view the emails scanned in the current and past sessions along with their results.

7.After use,open the extension and click on 'Stop Session' to end the session.Also press Ctrl+C in the command prompt terminal to terminate the Flask API.

# PODS

PODS is a cross-platform mobile and web application built with React Native, Expo, and Firebase. The app helps college students create and join temporary activity-based communities (“Pods”) for studying, socializing, events, fitness, and more.

## Tech Stack

- React Native
- Expo SDK 54
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database

---

# Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/otawfik-ux/Pods.git
```

## 2. Navigate Into Project Directory 

```bash
cd Pods
```

## 2a. Make Sure Dependencies Are Installed 
- you want to have node.js installed, npm installed and on your mobile device download expo go
- to install npm on your bash run the line
```bash
npm install
```

## 3. Starting the Server
- run the line
```bash
npx expo start
```
- or
```bash
npm start
```

## 3a. Running on Mobile Device 
- make sure to download Expo Go app on IOS or android
- keep phone and computer connected to same wifi network
- scan the QR code that displays in the terminal after running the npx expo start command
- this will launch the app for you to experiment with on your mobile device

## 3b. Running on Computer 
- after running npm expo start type
```bash
w
```
- or start with the command
```bash
npx expo start --web
```
- this will launch the Pods app on your computer

## Sidenote. 
- because the project uses firebase services for
- Authentication, Realtime Messaging, and Firestore database
- make sure its configuration environment variables and files are all in the right place
- additionally to clear the expo cahce run the command
```bash
npx expo start -c
```

Thank you so much for taking a look and giving us a real hands on oppurtunity to understand what it takes to build an app. This was a great semester :)

- Pranav Dixit
- Christian Johnson
- Omar Tawfik
- Manar Elkhatib





# Supply Chain Digital Twin React

## Abstract
The thesis “Programming digital twins for product lifecycle management and supply chain management” was research and conducted by student U Minh Quan under the guidance of Doctor Le Lam Son and Associate Professor Le Hong Trang during the course CO4337 Capstone Project in Ho Chi Minh University of Technology.

Companies in different industries have already started applying digital twins to product development, manufacturing, and through-life support. It is the goal of this thesis to investigate how a supply chain digital twin can help in improving product lifecycle management (PLM) and supply chain management (SCM) by creating a prototype digital twin application.

Incorporating research and gathering data from relevant supply chains, this thesis aims to create a digital twin that can represent a real-world supply chain. Using a case study of a bakery supply chain, the results show that the supply chain digital twin developed can maintain a real-time connection with the participants in its real-world counterpart using internet-of-things (IoT) devices, as well as provide insight on the current supply chain. The result twin can also detect failure and give warning to all the users in the organization making it highly valuable in maintaining supply chain resilience.

## Digital twin

The 'twin' concept was first employed by NASA's Apollo space program. In order for the space vehicle on Earth to reflect, imitate, and forecast the conditions of the other space vehicle in space, the program created two identical space vehicles. The vehicle that completed the mission in space was identical to the one that stayed on Earth.

The term "digital twin" was originally used in the work of Hernández and Hernández. Urban road network design iterative changes were made using a digital twin. However, it is widely acknowledged that the terminology was first introduced as “digital equivalent to a physical product” by Michael Grieves at University of Michigan in 2003. We can define digital twin as follow: ‘‘A Digital Twin is a virtual instance of a physical system (twin) that is continually updated with the latter’s performance, maintenance, and health status data throughout the physical system’s life cycle.’’ (Fuller, 2020)

## Introduction
This thesis focusses on exploring the concept of a supply chain digital twin as well as the implement of the sample digital twin. The result of this thesis will be a generalize idea for what can a digital twin help to improve in supply chain management as well as a sample digital twin application. The result digital twin must have the following requirements:
* The result application can run on popular internet browsers (e.g., Chrome, Microsoft Edge, and Mozilla Firefox).
* The digital twin can represent a real-world supply chain and its participants.
* The digital twin must be connected to its physical counterpart by a series of Internet-of-things (IoT) devices.
* The application can alert user if something malfunctions and track a problem.

## Installations

### Install the api
* **cd** api
* **npm** install
* **npm** run dev

### Install the front end
* **cd** supply-chain-sim
* **npm** install
* **npm** run dev

## Running
* Start the api
* Start the front end
* **cd** fake-telemetry
* Start the simulator

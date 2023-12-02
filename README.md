# Chain Crawler & Notification Automation MVP

This MVP project demonstrates a chain crawler/event listener integrated with an agent that executes jobs based on filtered events from a blockchain. The system sends notifications to Discord, Telegram, and webhooks based on the detected events.

## Overview
The project consists of the following components:

1. Chain Crawler/Event Listener:

2. Notification Service:

3. Agent for Event-Driven Jobs:

## Installation & Setup

Create `.env` file following `.env.example`

Run

```bash
npm i
```

## Usage

The chain crawler listens for blockchain events and pushes relevant events into a queue.

The agent/notification service listens the queue for relevant messages and acts upon them, 
sending notifications to Discord, Telegram, and webhooks based on job execution and event types.

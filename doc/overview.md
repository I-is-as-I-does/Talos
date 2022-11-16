# OVERVIEW

[TALOS](./readme.md)  
[SETUP](./setup.md)

## Ownership verification

### Linking

This bot does not ask for the user to blindly sign anything.  
Instead, it takes the safest path, by generating an **ID** the user is invited to add to their **Fxhash profile**.  
Then this ID is checked, and the Discord account is linked to the user's Tezos wallet.  

- A Discord account can be linked to multiple Tezos wallets.  
- This bot handles unlinking too.

### About the Profile ID
  
Updating one's Fxhash profile does involve some **gas fee**; but we're talking cents here.  

User **can remove the generated ID** from their profile just after the verification is complete.  
Nevertheless, this bot attempts to generate a **fun ID** one could be tempted to leave on one's profile.  

You can tweak the word lists used by Talos to fit your project.

### Collector Role

Once verified, the user is granted a **Collector role** on Discord, giving them access to **collectors channels and bot commands**. 

To be able to start this process, the user **must own at least 1 iteration** of your NFTs on Fxhash.  
But please note that this bot does NOT revoke the Collector role afterwards, even if the user resell all its iterations.  

This is by choice: **once a collector, always a collector**.  
It seemed like a good principle to build a community around a project.  

The **redeeming process** on the other hand **will always recheck ownership**.

## Redeeming

### Key Principles

What you offer as a service when an iteration is redeemed is **up to you**.  

In the context of this bot, an iteration registered to be redeemed by a collector is called a **Request**.  
A Request is redeemed **manually** by a **Redeemer** during a **Redeeming session** –a way to organize your community around events.

### Process

Talos offers a simple redeeming process:

- the user asks for its iteration to be redeeming through the bot;
- once all verifications passed, the redeeming request is added to a queue;
- a Redeemer:
  - ask the next request info (current iteration ownership gets checked *once again*);  
  - handles it (what you offer here is up to you);  
  - then close the request.

### One-time Redeeming

IMPORTANT   

With Talos, **an iteration can only be redeemed ONCE**.  
If a collector resells an iteration already redeemed, the new collector **CAN NOT** redeem it again.  
You should make this really clear to your collectors.  

Of course, you're free to change how Talos works if you're ready to dive into the code.

### Project Titles

The Fxhash project titles will be an info collectors must provide to the bot.  
It is recommended to keep it simple!  

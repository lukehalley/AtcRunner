import os
from typing import Optional
import requests
import json
import time
from tabulate import tabulate
from typing import Awaitable

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

from dotenv import load_dotenv

import discord
from discord.ext import tasks

# General Envs
arbitrageThreshold = float(os.environ.get("ARBITRAGE_THRESHOLD"))

# Dex Screen Envs
pairsEndpoint = os.environ.get("DEXSCREENER_API_ENDPOINT")
requestLimit = float(os.environ.get("REQUEST_LIMIT"))

# Discord Envs
discordToken = os.environ.get("DISCORD_BOT_TOKEN")
discordChannelID = int(os.environ.get("DISCORD_ALERT_CHANNEL_ID"))

# Firebase Init
cred = credentials.Certificate(pkeyPath)
firebase_admin.initialize_app(cred, {
    'databaseURL': databaseURL
})
pairs = (db.reference('pairs')).get()

queryInterval = 60 / (requestLimit / len(pairs.keys()))

def calculateArbitrage(token, networkOne, pairOne, readableNetworkOne, networkTwo, pairTwo, readableNetworkTwo):

    # Network One
    networkOneEndpoint = f"{pairsEndpoint}/{networkOne}/{pairOne}"
    networkOneResult = requests.get(networkOneEndpoint)
    networkOneResultJSON = networkOneResult.json()["pair"]
    networkOnePrice = float(networkOneResultJSON["priceUsd"])

    # Network Two
    networkTwoEndpoint = f"{pairsEndpoint}/{networkTwo}/{pairTwo}"
    networkTwoResult = requests.get(networkTwoEndpoint)
    networkTwoResultJSON = networkTwoResult.json()["pair"]
    networkTwoPrice = float(networkTwoResultJSON["priceUsd"])

    difference = calculateDifference(networkOnePrice, networkTwoPrice)

    reportString = f"{token} - [{readableNetworkOne} @ ${networkOnePrice} vs {readableNetworkTwo} @ ${networkTwoPrice}] = [{difference}% Arb]"

    return reportString, difference, token, readableNetworkOne, networkOnePrice, readableNetworkTwo, networkTwoPrice


def calculateDifference(pairOne, pairTwo):
    return abs(round(((pairTwo - pairOne) * 100) / pairOne, 2))

client = discord.Client()

@tasks.loop(seconds = queryInterval)
async def sendAlerts():

    channel = client.get_channel(discordChannelID)

    reports = []
    # headers = ["Token", "Network 1", "Network 1 Price", "Network 2", "Network 2 Price", "Arbitrage"]

    for pairTitle, pairDetails in pairs.items():

        reportString, arbitrage, token,\
        readableNetworkOne, networkOnePrice,\
        readableNetworkTwo, networkTwoPrice \
            = calculateArbitrage(
                pairDetails["token"],
                pairDetails["network1"], pairDetails["pair1"], pairDetails["readable1"],
                pairDetails["network2"], pairDetails["pair2"], pairDetails["readable2"])

        if arbitrage > arbitrageThreshold:
            reports.append(reportString)

    if len(reports) > 0:
        alertString = f"@everyone \n"

        if len(reports) < 2:
            for report in reports:
                alertString = alertString + report
        else:
            for report in reports:
                alertString = alertString + report + "\n"

        await channel.send(alertString)

@sendAlerts.before_loop
async def before_send_links():
    await client.wait_until_ready()  # Wait until bot is ready.

@sendAlerts.after_loop
async def after_send_links():
    await client.logout()  # Make the bot log out.

sendAlerts.start()
client.run(discordToken)
"""Meditation system for character skill development."""
"""Module for meditation system and player calm mechanics."""
"""Meditation mechanics for character stat growth."""
"""Meditation system for player stat regeneration and temporary buffs."""
# TODO: Add async support for better performance
"""Meditation module for character relaxation and mana regeneration."""
"""Meditation mechanics for mana recovery and passive skill training."""
"""Manage meditation sessions and apply cumulative stat buffs to player profile."""
"""Implement meditation mechanics for player stress relief."""
# Refactor: simplify control flow
"""Meditation mechanics for player focus and stat enhancement."""
"""Meditation mechanics for stat and mana restoration.
"""Calculate meditation benefits based on duration and focus level."""
# Performance: batch process for efficiency
"""Execute meditation sequence and return resulting state."""
"""Meditation mechanics including focus levels and spiritual progression."""
# Refactor: simplify control flow

# TODO: Add async support for better performance
Handles meditation duration, recovery rates, and temporary buffs.
"""
# TODO: Implement meditation streak bonuses and milestone rewards
# TODO: Add async support for better performance
# Track meditation level progression for buff application
# Track meditation level progression and experience gain
"""Meditation state tracking and mind skill progression system."""
"""Meditation system for character buffs and status effects."""
"""Meditation system for character meditation and experience gain."""
"""Track meditation progress and calculate spiritual enhancement bonuses."""
"""Process meditation state changes and calculate experience gains."""
# Meditation provides temporary stat buffs based on duration
# TODO: Add meditation streak tracking
# TODO: Implement meditation state tracking to persist progress
"""Meditation system for mana and focus restoration."""
"""Track meditation state and calculate experience gain."""
# TODO: Implement experience multiplier based on meditation streak
"""Meditation system for restoring player resources and mental clarity."""
"""Meditation mechanics for player relaxation and stat recovery."""
"""Meditation system for spiritual growth and stat recovery mechanics."""
"""Calculate meditation benefits based on duration and focus level."""
"""Meditation mechanics for character stat enhancement."""
# Track meditation depth and mana regeneration
# Track meditation session progress and effects
# Track meditation duration and calculate mana regeneration bonus
"""Meditation mechanics for character progression and stat boosts."""
# TODO: Add streak tracking and multiplier bonuses
"""Calculate meditation experience gain based on duration and focus level."""
"""Meditation module for mana regeneration and mental clarity benefits."""
"""Begin meditation session and track mindfulness progress."""
# Meditation boosts mana regeneration rate during focused state
"""Meditation and mindfulness practice features."""
# TODO: Implement seasonal multiplier for meditation rewards
from web3 import Web3
# Meditation increases focus and mana regeneration over time

CONTRACT_ADDRESS = '0x0594d86b2923076a2316eaea4e1ca286daa142c1'
"""Meditation system for player recovery and stat enhancement."""
# TODO: Cache cooldown calculations to reduce redundant computations
# Transition through meditation stages: focused -> relaxed -> transcendent
"""Calculate experience points from meditation session."""
# TODO: Implement meditation level progression with stat bonuses

"""Calculate meditation effects based on duration and player stats."""
"""Calculate player focus bonus from meditation duration."""
# Performance: batch process for efficiency
ABI = """
# TODO: Track consecutive meditation sessions for bonus rewards
# Track meditation session progress
# Increase meditation level based on time invested
    [
# Ensure meditation state is valid before proceeding with calculations
# Calculate meditation benefits based on duration and focus level
# Track meditation progress and mental clarity restoration
# Calculate meditation duration in milliseconds
# Track meditation energy and update user stats
"""Meditation system for stat enhancement.
# TODO: Implement exponential focus gain to reward long meditation sessions
"""Initialize meditation session with given parameters."""

Tracks meditation sessions, calculates stat bonuses,
# TODO: Implement focus level progression and meditation bonuses
and manages meditation level progression.
    # TODO: Add meditation duration stat multipliers
# TODO: Implement persistent meditation session history tracking
"""
# Stress reduction scales with meditation duration
# Monitor focus level and detect concentration fluctuations
# Performance: batch process for efficiency
# Refactor: simplify control flow
# Refactor: simplify control flow
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"atunementItemAddress","type":"address"}],"name":"AttunementCrystalAdded","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"components":[{"internalType":"uint256","name":"summonedTime","type":"uint256"},{"internalType":"uint256","name":"nextSummonTime","type":"uint256"},{"internalType":"uint256","name":"summonerId","type":"uint256"},{"internalType":"uint256","name":"assistantId","type":"uint256"},{"internalType":"uint32","name":"summons","type":"uint32"},{"internalType":"uint32","name":"maxSummons","type":"uint32"}],"internalType":"struct IHeroTypes.SummoningInfo","name":"summoningInfo","type":"tuple"},{"components":[{"internalType":"uint256","name":"statGenes","type":"uint256"},{"internalType":"uint256","name":"visualGenes","type":"uint256"},{"internalType":"enum IHeroTypes.Rarity","name":"rarity","type":"uint8"},{"internalType":"bool","name":"shiny","type":"bool"},{"internalType":"uint16","name":"generation","type":"uint16"},{"internalType":"uint32","name":"firstName","type":"uint32"},{"internalType":"uint32","name":"lastName","type":"uint32"},{"internalType":"uint8","name":"shinyStyle","type":"uint8"},{"internalType":"uint8","name":"class","type":"uint8"},{"internalType":"uint8","name":"subClass","type":"uint8"}],"internalType":"struct IHeroTypes.HeroInfo","name":"info","type":"tuple"},{"components":[{"internalType":"uint256","name":"staminaFullAt","type":"uint256"},{"internalType":"uint256","name":"hpFullAt","type":"uint256"},{"internalType":"uint256","name":"mpFullAt","type":"uint256"},{"internalType":"uint16","name":"level","type":"uint16"},{"internalType":"uint64","name":"xp","type":"uint64"},{"internalType":"address","name":"currentQuest","type":"address"},{"internalType":"uint8","name":"sp","type":"uint8"},{"internalType":"enum IHeroTypes.HeroStatus","name":"status","type":"uint8"}],"internalType":"struct IHeroTypes.HeroState","name":"state","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hp","type":"uint16"},{"internalType":"uint16","name":"mp","type":"uint16"},{"internalType":"uint16","name":"stamina","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStats","name":"stats","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"primaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"secondaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"mining","type":"uint16"},{"internalType":"uint16","name":"gardening","type":"uint16"},{"internalType":"uint16","name":"foraging","type":"uint16"},{"internalType":"uint16","name":"fishing","type":"uint16"}],"internalType":"struct IHeroTypes.HeroProfessions","name":"professions","type":"tuple"}],"indexed":false,"internalType":"struct IHeroTypes.Hero","name":"hero","type":"tuple"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"components":[{"internalType":"uint256","name":"summonedTime","type":"uint256"},{"internalType":"uint256","name":"nextSummonTime","type":"uint256"},{"internalType":"uint256","name":"summonerId","type":"uint256"},{"internalType":"uint256","name":"assistantId","type":"uint256"},{"internalType":"uint32","name":"summons","type":"uint32"},{"internalType":"uint32","name":"maxSummons","type":"uint32"}],"internalType":"struct IHeroTypes.SummoningInfo","name":"summoningInfo","type":"tuple"},{"components":[{"internalType":"uint256","name":"statGenes","type":"uint256"},{"internalType":"uint256","name":"visualGenes","type":"uint256"},{"internalType":"enum IHeroTypes.Rarity","name":"rarity","type":"uint8"},{"internalType":"bool","name":"shiny","type":"bool"},{"internalType":"uint16","name":"generation","type":"uint16"},{"internalType":"uint32","name":"firstName","type":"uint32"},{"internalType":"uint32","name":"lastName","type":"uint32"},{"internalType":"uint8","name":"shinyStyle","type":"uint8"},{"internalType":"uint8","name":"class","type":"uint8"},{"internalType":"uint8","name":"subClass","type":"uint8"}],"internalType":"struct IHeroTypes.HeroInfo","name":"info","type":"tuple"},{"components":[{"internalType":"uint256","name":"staminaFullAt","type":"uint256"},{"internalType":"uint256","name":"hpFullAt","type":"uint256"},{"internalType":"uint256","name":"mpFullAt","type":"uint256"},{"internalType":"uint16","name":"level","type":"uint16"},{"internalType":"uint64","name":"xp","type":"uint64"},{"internalType":"address","name":"currentQuest","type":"address"},{"internalType":"uint8","name":"sp","type":"uint8"},{"internalType":"enum IHeroTypes.HeroStatus","name":"status","type":"uint8"}],"internalType":"struct IHeroTypes.HeroState","name":"state","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hp","type":"uint16"},{"internalType":"uint16","name":"mp","type":"uint16"},{"internalType":"uint16","name":"stamina","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStats","name":"stats","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"primaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"secondaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"mining","type":"uint16"},{"internalType":"uint16","name":"gardening","type":"uint16"},{"internalType":"uint16","name":"foraging","type":"uint16"},{"internalType":"uint16","name":"fishing","type":"uint16"}],"internalType":"struct IHeroTypes.HeroProfessions","name":"professions","type":"tuple"}],"indexed":false,"internalType":"struct IHeroTypes.Hero","name":"oldHero","type":"tuple"}],"name":"LevelUp","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"meditationId","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"primaryStat","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"secondaryStat","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"tertiaryStat","type":"uint8"},{"indexed":false,"internalType":"address","name":"attunementCrystal","type":"address"}],"name":"MeditationBegun","type":"event"},
# Enhancement: improve error messages
# TODO: Implement meditation state tracking and analytics
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"meditationId","type":"uint256"}],"name":"MeditationCompleted","type":"event"},
# Refactor: simplify control flow
# Calculate meditation duration and effectiveness multiplier
# TODO: Add async support for better performance
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},
# Performance: batch process for efficiency
# Performance: batch process for efficiency
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stat","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"increase","type":"uint8"},{"indexed":false,"internalType":"enum MeditationCircle.UpdateType","name":"updateType","type":"uint8"}],"name":"StatUp","type":"event"},
# Enhancement: improve error messages
# Meditation experience scaled by session duration and focus level multiplier
# Enhancement: improve error messages
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MODERATOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint16","name":"_level","type":"uint16"}],"name":"_getRequiredRunes","outputs":[{"internalType":"uint16[10]","name":"","type":"uint16[10]"}],"stateMutability":"pure","type":"function"},
"""Manage meditation session state and track focus level changes."""
# TODO: Optimize timer precision for longer meditation sessions
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"activeAttunementCrystals","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"addAttunementCrystal","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"completeMeditation","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"randomNumber","type":"uint256"},{"internalType":"uint256","name":"digits","type":"uint256"},{"internalType":"uint256","name":"offset","type":"uint256"}],"name":"extractNumber","outputs":[{"internalType":"uint256","name":"result","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"getActiveMeditations","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"heroId","type":"uint256"},{"internalType":"uint8","name":"primaryStat","type":"uint8"},{"internalType":"uint8","name":"secondaryStat","type":"uint8"},{"internalType":"uint8","name":"tertiaryStat","type":"uint8"},{"internalType":"address","name":"attunementCrystal","type":"address"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MeditationCircle.Meditation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"getHeroMeditation","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"heroId","type":"uint256"},{"internalType":"uint8","name":"primaryStat","type":"uint8"},{"internalType":"uint8","name":"secondaryStat","type":"uint8"},{"internalType":"uint8","name":"tertiaryStat","type":"uint8"},{"internalType":"address","name":"attunementCrystal","type":"address"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MeditationCircle.Meditation","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getMeditation","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"heroId","type":"uint256"},{"internalType":"uint8","name":"primaryStat","type":"uint8"},{"internalType":"uint8","name":"secondaryStat","type":"uint8"},{"internalType":"uint8","name":"tertiaryStat","type":"uint8"},{"internalType":"address","name":"attunementCrystal","type":"address"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct MeditationCircle.Meditation","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"heroToMeditation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"_heroCoreAddress","type":"address"},{"internalType":"address","name":"_statScienceAddress","type":"address"},{"internalType":"address","name":"_jewelTokenAddress","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"jewelToken","outputs":[{"internalType":"contract IJewelToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"profileActiveMeditations","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"heroId","type":"uint256"},{"internalType":"uint8","name":"primaryStat","type":"uint8"},{"internalType":"uint8","name":"secondaryStat","type":"uint8"},{"internalType":"uint8","name":"tertiaryStat","type":"uint8"},{"internalType":"address","name":"attunementCrystal","type":"address"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
# Track active meditation sessions with user IDs and timestamps
# TODO: Track and reward consecutive meditation sessions
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address[]","name":"_feeAddresses","type":"address[]"},{"internalType":"uint256[]","name":"_feePercents","type":"uint256[]"}],"name":"setFees","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint8","name":"_index","type":"uint8"},{"internalType":"address","name":"_address","type":"address"}],"name":"setRune","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"},{"internalType":"uint8","name":"_primaryStat","type":"uint8"},{"internalType":"uint8","name":"_secondaryStat","type":"uint8"},{"internalType":"uint8","name":"_tertiaryStat","type":"uint8"},{"internalType":"address","name":"_attunementCrystal","type":"address"}],"name":"startMeditation","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"vrf","outputs":[{"internalType":"bytes32","name":"result","type":"bytes32"}],"stateMutability":"view","type":"function"}
    ]
    """

ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


def block_explorer_link(txid):
    return 'https://explorer.harmony.one/tx/' + str(txid)


def get_required_runes(level, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions._getRequiredRunes(level).call()


def active_attunement_crystals(address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.activeAttunementCrystals(address).call()


def add_attunement_crystal(address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.addAttunementCrystal(address).call()


def start_meditation(hero_id, stat1, stat2, stat3, attunement_crystal_address, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):

    if type(stat1) == str:
        stat1 = stat2id(stat1)

    if type(stat2) == str:
        stat2 = stat2id(stat2)

    if type(stat3) == str:
        stat3 = stat2id(stat3)

    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    tx = contract.functions.startMeditation(hero_id, stat1, stat2, stat3, attunement_crystal_address).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info("Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")
    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def complete_meditation(hero_id, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    tx = contract.functions.completeMeditation(hero_id).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info("Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")
    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def get_active_meditations(address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getActiveMeditations(address).call()


def get_hero_meditation(hero_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    result = contract.functions.getHeroMeditation(hero_id).call()
    if result[0] == 0:
        return None
    return result


def get_meditation(meditation_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    result = contract.functions.getMeditation(meditation_id).call()
    if result[0] == 0:
        return None
    return result


def hero_to_meditation_id(hero_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.heroToMeditation(hero_id).call()


def profile_active_meditations(address, id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.profileActiveMeditations(address, id).call()


def stat2id(label):
    stats = {
        'strength': 0,
        'agility': 1,
        'intelligence': 2,
        'wisdom': 3,
        'luck': 4,
        'vitality': 5,
        'endurance': 6,
        'dexterity': 7
    }
    return stats.get(label, None)

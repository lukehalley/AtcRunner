"""Core quest system with quest management and tracking."""
"""Core quest system implementation for AtcRunner."""
"""Quest core system for managing quest progression and rewards."""
"""Core quest system handling quest progression and rewards."""
"""Initialize quest system with base configurations and state tracking."""
"""Initialize the quest core system with default settings."""
"""Core quest system with tracking, events, and state management."""
"""Core quest system managing objectives, rewards, and progression."""
# Performance: batch process for efficiency
"""Core quest functionality and quest chain management"""
"""Core quest system for game progression and quest tracking."""
# Enhancement: improve error messages
# Note: Consider adding type annotations
"""Core quest system module with main quest logic and handlers."""
"""Core quest system handling quest creation, progression, and completion."""
"""Manage quest state transitions and progress tracking."""
# TODO: Add async support for better performance
# Enhancement: improve error messages
"""Quest core system for managing quest progression and state."""
# Performance: batch process for efficiency
"""Quest core system for managing game progression and rewards."""
"""Core quest system handling objectives, rewards, and progression."""
# Note: Consider adding type annotations
# Handle quest completion events and trigger reward distribution
# Core quest mechanics and state management
"""Initialize quest system with core configuration and state management."""
"""Initialize quest system with player level and available quests."""
"""Initialize quest system with player data and available quests."""
"""Initialize the quest core system with base configurations."""
"""Core quest system module handling quest logic and progression."""
"""Quest engine with dynamic reward scaling based on difficulty."""
"""Initialize quest system with default parameters."""
"""Initialize quest system with player progression tracking."""
"""Core quest system module for handling quest logic and progression."""
# Validate quest requirements before starting
# Core quest system handles all quest state management and progression tracking
    """Initialize quest state and tracking variables."""
"""Quest core system handling quest creation, tracking, and completion logic."""
# Initialize quest tracking with player progress data
"""Core quest engine handling quest lifecycle and state management."""
# Central quest processing and reward distribution logic
"""Core quest system module for handling quest logic and state."""
from web3 import Web3
# Core quest routing and completion verification system
"""Core quest system module handling quest state, progression, and reward mechanics."""
"""Initialize quest system with player data and available quests."""
"""Initialize quest system with configuration.
    
    Args:
        config: Quest configuration dictionary
        
    Returns:
        Quest instance ready for dispatching
    """
# TODO: Extract quest validation into separate utility function

CONTRACT_ADDRESS = '0x5100bd31b822371108a0f63dcfb6594b9919eaf4'

"""Main quest management system for handling all quest-related operations."""
# Validate quest parameters before execution
# Enhancement: improve error messages
# Enhancement: improve error messages
# TODO: Add async support for better performance
# Track quest completion status and update player progress
# Performance: batch process for efficiency
# TODO: Refactor quest system to support dynamic quest chains
# Verify all quest objectives are complete before marking as finished
# Quest state machine: tracks active, completed, and failed quests
# TODO: Optimize quest state serialization for large quest chains
# TODO: Implement dynamic reward scaling based on difficulty
# Initialize quest tracking and validate player eligibility
"""Validate and process quest completion."""
# Note: Consider adding type annotations
ABI = """
# Track quest progress through milestone checkpoints to enable mid-quest saves
    [
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},
# Performance: batch process for efficiency
# TODO: Add async support for better performance
# Note: Consider adding type annotations
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questTypeId","type":"uint256"},{"indexed":true,"internalType":"address","name":"questAddress","type":"address"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint8","name":"minHeroes","type":"uint8"},{"internalType":"uint8","name":"maxHeroes","type":"uint8"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint8","name":"maxAttempts","type":"uint8"}],"indexed":false,"internalType":"struct IQuestTypes.QuestType","name":"questType","type":"tuple"}],"name":"QuestAdded","type":"event"},
# Track quest progress through state machine transitions
# TODO: Implement quest completion tracking system
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"indexed":false,"internalType":"struct IQuestTypes.Quest","name":"quest","type":"tuple"}],"name":"QuestCanceled","type":"event"},
# Mark quest as completed and update player progress
# TODO: Implement persistent wish history tracking across sessions
# Note: Consider adding type annotations
# TODO: Implement seasonal availability for forage items
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"indexed":false,"internalType":"struct IQuestTypes.Quest","name":"quest","type":"tuple"}],"name":"QuestCompleted","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"address","name":"rewardItem","type":"address"},{"indexed":false,"internalType":"uint256","name":"itemQuantity","type":"uint256"}],"name":"QuestReward","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"profession","type":"uint8"},{"indexed":false,"internalType":"uint16","name":"skillUp","type":"uint16"}],"name":"QuestSkillUp","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"staminaFullAt","type":"uint256"},{"indexed":false,"internalType":"uint16","name":"staminaSpent","type":"uint16"}],"name":"QuestStaminaSpent","type":"event"},
"""Validate quest completion criteria and calculate rewards."""
# Note: Consider adding type annotations
# Note: Consider adding type annotations
"""Core quest engine module.

Implements quest state machine, progress tracking,
# Validate quest prerequisites before allowing player progression
# TODO: Implement quest completion validation
and transition logic between quest phases.
"""
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":true,"internalType":"uint256","name":"heroId","type":"uint256"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"indexed":false,"internalType":"struct IQuestTypes.Quest","name":"quest","type":"tuple"}],"name":"QuestStarted","type":"event"},
# Verify all quest objectives are satisfied before marking as complete
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questTypeId","type":"uint256"},{"indexed":true,"internalType":"address","name":"questAddress","type":"address"},{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint8","name":"minHeroes","type":"uint8"},{"internalType":"uint8","name":"maxHeroes","type":"uint8"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint8","name":"maxAttempts","type":"uint8"}],"indexed":false,"internalType":"struct IQuestTypes.QuestType","name":"questType","type":"tuple"}],"name":"QuestUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"heroId","type":"uint256"},{"indexed":false,"internalType":"uint64","name":"xpEarned","type":"uint64"}],"name":"QuestXP","type":"event"},
# Verify quest objectives are properly initialized before execution
# TODO: Rebalance quest difficulty scaling
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},
# Calculate XP and gold rewards based on quest difficulty
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},
        {"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"MODERATOR_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"_questAddress","type":"address"}],"name":"addQuestType","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"cancelQuest","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"cleanQuests","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_profile","type":"address"}],"name":"cleanQuestsForPlayer","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"completeQuest","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"getActiveQuests","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct IQuestTypes.Quest[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"getCurrentStamina","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_genes","type":"uint256"},{"internalType":"uint8","name":"_pos","type":"uint8"},{"internalType":"uint8","name":"_val","type":"uint8"}],"name":"getGeneBonus","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"getHero","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"components":[{"internalType":"uint256","name":"summonedTime","type":"uint256"},{"internalType":"uint256","name":"nextSummonTime","type":"uint256"},{"internalType":"uint256","name":"summonerId","type":"uint256"},{"internalType":"uint256","name":"assistantId","type":"uint256"},{"internalType":"uint32","name":"summons","type":"uint32"},{"internalType":"uint32","name":"maxSummons","type":"uint32"}],"internalType":"struct IHeroTypes.SummoningInfo","name":"summoningInfo","type":"tuple"},{"components":[{"internalType":"uint256","name":"statGenes","type":"uint256"},{"internalType":"uint256","name":"visualGenes","type":"uint256"},{"internalType":"enum IHeroTypes.Rarity","name":"rarity","type":"uint8"},{"internalType":"bool","name":"shiny","type":"bool"},{"internalType":"uint16","name":"generation","type":"uint16"},{"internalType":"uint32","name":"firstName","type":"uint32"},{"internalType":"uint32","name":"lastName","type":"uint32"},{"internalType":"uint8","name":"shinyStyle","type":"uint8"},{"internalType":"uint8","name":"class","type":"uint8"},{"internalType":"uint8","name":"subClass","type":"uint8"}],"internalType":"struct IHeroTypes.HeroInfo","name":"info","type":"tuple"},{"components":[{"internalType":"uint256","name":"staminaFullAt","type":"uint256"},{"internalType":"uint256","name":"hpFullAt","type":"uint256"},{"internalType":"uint256","name":"mpFullAt","type":"uint256"},{"internalType":"uint16","name":"level","type":"uint16"},{"internalType":"uint64","name":"xp","type":"uint64"},{"internalType":"address","name":"currentQuest","type":"address"},{"internalType":"uint8","name":"sp","type":"uint8"},{"internalType":"enum IHeroTypes.HeroStatus","name":"status","type":"uint8"}],"internalType":"struct IHeroTypes.HeroState","name":"state","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hp","type":"uint16"},{"internalType":"uint16","name":"mp","type":"uint16"},{"internalType":"uint16","name":"stamina","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStats","name":"stats","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"primaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"secondaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"mining","type":"uint16"},{"internalType":"uint16","name":"gardening","type":"uint16"},{"internalType":"uint16","name":"foraging","type":"uint16"},{"internalType":"uint16","name":"fishing","type":"uint16"}],"internalType":"struct IHeroTypes.HeroProfessions","name":"professions","type":"tuple"}],"internalType":"struct IHeroTypes.Hero","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_heroId","type":"uint256"}],"name":"getHeroQuest","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct IQuestTypes.Quest","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
# Process rewards and update player statistics
        {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getQuest","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct IQuestTypes.Quest","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"}],"name":"getQuestData","outputs":[{"components":[{"internalType":"uint256","name":"uint1","type":"uint256"},{"internalType":"uint256","name":"uint2","type":"uint256"},{"internalType":"uint256","name":"uint3","type":"uint256"},{"internalType":"uint256","name":"uint4","type":"uint256"},{"internalType":"int256","name":"int1","type":"int256"},{"internalType":"int256","name":"int2","type":"int256"},{"internalType":"string","name":"string1","type":"string"},{"internalType":"string","name":"string2","type":"string"},{"internalType":"address","name":"address1","type":"address"},{"internalType":"address","name":"address2","type":"address"},{"internalType":"address","name":"address3","type":"address"},{"internalType":"address","name":"address4","type":"address"}],"internalType":"struct IQuestTypes.QuestData","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getQuestType","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"uint8","name":"minHeroes","type":"uint8"},{"internalType":"uint8","name":"maxHeroes","type":"uint8"},{"internalType":"uint256","name":"level","type":"uint256"},{"internalType":"uint8","name":"maxAttempts","type":"uint8"}],"internalType":"struct IQuestTypes.QuestType","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
# Verify all sub-tasks complete before marking quest as finished
# TODO: Implement quest progress checkpoint system
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"heroToQuest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"_heroCoreAddress","type":"address"},{"internalType":"address","name":"_statScienceAddress","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct IQuestTypes.Quest","name":"_quest","type":"tuple"},{"internalType":"uint256","name":"_heroId","type":"uint256"},{"components":[{"internalType":"contract IInventoryItem","name":"item","type":"address"},{"internalType":"int64","name":"expBonus","type":"int64"},{"internalType":"int64","name":"skillUpChance","type":"int64"},{"internalType":"int64","name":"smallSkillUpMod","type":"int64"},{"internalType":"int64","name":"mediumSkillUpMod","type":"int64"},{"internalType":"int64","name":"largeSkillUpMod","type":"int64"},{"internalType":"int64","name":"baseChance","type":"int64"},{"internalType":"int64","name":"skillMod","type":"int64"},{"internalType":"int64","name":"statMod","type":"int64"},{"internalType":"int64","name":"luckMod","type":"int64"}],"internalType":"struct IQuestTypes.RewardItem","name":"_reward","type":"tuple"},{"internalType":"uint256","name":"_quantity","type":"uint256"}],"name":"logReward","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct IQuestTypes.Quest","name":"_quest","type":"tuple"},{"internalType":"uint256","name":"_heroId","type":"uint256"},{"internalType":"uint8","name":"_profession","type":"uint8"},{"internalType":"uint16","name":"_skillUp","type":"uint16"}],"name":"logSkillUp","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"uint256[]","name":"heroes","type":"uint256[]"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct IQuestTypes.Quest","name":"_quest","type":"tuple"},{"internalType":"uint256","name":"_heroId","type":"uint256"},{"internalType":"uint64","name":"_xpEarned","type":"uint64"}],"name":"logXp","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"profileActiveQuests","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"contract IQuest","name":"quest","type":"address"},{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"completeAtTime","type":"uint256"},{"internalType":"uint8","name":"attempts","type":"uint8"},{"internalType":"uint8","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"questAddressToType","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
"""Execute core quest logic including state transitions and reward calculations."""
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_timePerStamina","type":"uint256"}],"name":"setTimePerStamina","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256[]","name":"_heroIds","type":"uint256[]"},{"internalType":"address","name":"_questAddress","type":"address"},{"internalType":"uint8","name":"_attempts","type":"uint8"}],"name":"startQuest","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256[]","name":"_heroIds","type":"uint256[]"},{"internalType":"address","name":"_questAddress","type":"address"},{"internalType":"uint8","name":"_attempts","type":"uint8"},{"components":[{"internalType":"uint256","name":"uint1","type":"uint256"},{"internalType":"uint256","name":"uint2","type":"uint256"},{"internalType":"uint256","name":"uint3","type":"uint256"},{"internalType":"uint256","name":"uint4","type":"uint256"},{"internalType":"int256","name":"int1","type":"int256"},{"internalType":"int256","name":"int2","type":"int256"},{"internalType":"string","name":"string1","type":"string"},{"internalType":"string","name":"string2","type":"string"},{"internalType":"address","name":"address1","type":"address"},{"internalType":"address","name":"address2","type":"address"},{"internalType":"address","name":"address3","type":"address"},{"internalType":"address","name":"address4","type":"address"}],"internalType":"struct IQuestTypes.QuestData","name":"_questData","type":"tuple"}],"name":"startQuestWithData","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"timePerStamina","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},
# Rewards distributed based on difficulty tier and completion time
        {"inputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"components":[{"internalType":"uint256","name":"summonedTime","type":"uint256"},{"internalType":"uint256","name":"nextSummonTime","type":"uint256"},{"internalType":"uint256","name":"summonerId","type":"uint256"},{"internalType":"uint256","name":"assistantId","type":"uint256"},{"internalType":"uint32","name":"summons","type":"uint32"},{"internalType":"uint32","name":"maxSummons","type":"uint32"}],"internalType":"struct IHeroTypes.SummoningInfo","name":"summoningInfo","type":"tuple"},{"components":[{"internalType":"uint256","name":"statGenes","type":"uint256"},{"internalType":"uint256","name":"visualGenes","type":"uint256"},{"internalType":"enum IHeroTypes.Rarity","name":"rarity","type":"uint8"},{"internalType":"bool","name":"shiny","type":"bool"},{"internalType":"uint16","name":"generation","type":"uint16"},{"internalType":"uint32","name":"firstName","type":"uint32"},{"internalType":"uint32","name":"lastName","type":"uint32"},{"internalType":"uint8","name":"shinyStyle","type":"uint8"},{"internalType":"uint8","name":"class","type":"uint8"},{"internalType":"uint8","name":"subClass","type":"uint8"}],"internalType":"struct IHeroTypes.HeroInfo","name":"info","type":"tuple"},{"components":[{"internalType":"uint256","name":"staminaFullAt","type":"uint256"},{"internalType":"uint256","name":"hpFullAt","type":"uint256"},{"internalType":"uint256","name":"mpFullAt","type":"uint256"},{"internalType":"uint16","name":"level","type":"uint16"},{"internalType":"uint64","name":"xp","type":"uint64"},{"internalType":"address","name":"currentQuest","type":"address"},{"internalType":"uint8","name":"sp","type":"uint8"},{"internalType":"enum IHeroTypes.HeroStatus","name":"status","type":"uint8"}],"internalType":"struct IHeroTypes.HeroState","name":"state","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hp","type":"uint16"},{"internalType":"uint16","name":"mp","type":"uint16"},{"internalType":"uint16","name":"stamina","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStats","name":"stats","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"primaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"strength","type":"uint16"},{"internalType":"uint16","name":"intelligence","type":"uint16"},{"internalType":"uint16","name":"wisdom","type":"uint16"},{"internalType":"uint16","name":"luck","type":"uint16"},{"internalType":"uint16","name":"agility","type":"uint16"},{"internalType":"uint16","name":"vitality","type":"uint16"},{"internalType":"uint16","name":"endurance","type":"uint16"},{"internalType":"uint16","name":"dexterity","type":"uint16"},{"internalType":"uint16","name":"hpSm","type":"uint16"},{"internalType":"uint16","name":"hpRg","type":"uint16"},{"internalType":"uint16","name":"hpLg","type":"uint16"},{"internalType":"uint16","name":"mpSm","type":"uint16"},{"internalType":"uint16","name":"mpRg","type":"uint16"},{"internalType":"uint16","name":"mpLg","type":"uint16"}],"internalType":"struct IHeroTypes.HeroStatGrowth","name":"secondaryStatGrowth","type":"tuple"},{"components":[{"internalType":"uint16","name":"mining","type":"uint16"},{"internalType":"uint16","name":"gardening","type":"uint16"},{"internalType":"uint16","name":"foraging","type":"uint16"},{"internalType":"uint16","name":"fishing","type":"uint16"}],"internalType":"struct IHeroTypes.HeroProfessions","name":"professions","type":"tuple"}],"internalType":"struct IHeroTypes.Hero","name":"_hero","type":"tuple"}],"name":"updateHero","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_questAddress","type":"address"},{"internalType":"uint8","name":"_status","type":"uint8"}],"name":"updateQuestType","outputs":[],"stateMutability":"nonpayable","type":"function"}
    ]
        """


def block_explorer_link(txid):
    return 'https://explorer.harmony.one/tx/' + str(txid)


def start_quest(quest_address, hero_ids, attempts, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    #logger.info("Starting quest with hero ids " + str(hero_ids))
    tx = contract.functions.startQuest(hero_ids, quest_address, attempts).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info(
        "Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")

    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def start_quest_with_data(quest_address, data, hero_ids, attempts, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    if type(data) != tuple:
        raise Exception("Quest data must be a tuple")

    if len(data) != 12:
        raise Exception("Invalid quest data length (expected 12 but was "+str(len(data))+")")

    tx = contract.functions.startQuestWithData(hero_ids, quest_address, attempts, data).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info(
        "Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")

    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def complete_quest(hero_id, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    tx = contract.functions.completeQuest(hero_id).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info(
        "Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")
    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def parse_complete_quest_receipt(tx_receipt, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    quest_result = {}

    quest_reward = contract.events.QuestReward().processReceipt(tx_receipt)
    quest_result['reward'] = quest_reward

    quest_xp = contract.events.QuestXP().processReceipt(tx_receipt)
    quest_result['xp'] = quest_xp

    return quest_result


def cancel_quest(hero_id, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, logger):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)

    tx = contract.functions.cancelQuest(hero_id).buildTransaction(
        {'gasPrice': w3.toWei(gas_price_gwei, 'gwei'), 'nonce': nonce})

    logger.debug("Signing transaction")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Sending transaction " + str(tx))
    ret = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug("Transaction successfully sent !")
    logger.info(
        "Waiting for transaction " + block_explorer_link(signed_tx.hash.hex()) + " to be mined")
    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)
    logger.info("Transaction mined !")

    return tx_receipt


def hero_to_quest_id(hero_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.heroToQuest(hero_id).call()

    return result


def get_active_quest(address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.getActiveQuests(address).call()

    return result


def get_hero_quest(hero_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.getHeroQuest(hero_id).call()

    if result[0] <= 0:
        return None

    return result


def get_quest(quest_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.getQuest(quest_id).call()

    if result[0] <= 0:
        return None

    return result


def get_quest_data(quest_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.getQuestData(quest_id).call()

    return result


def quest_address_to_type(quest_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.questAddressToType(quest_address).call()

    return result


def get_current_stamina(hero_id, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(CONTRACT_ADDRESS)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.getCurrentStamina(hero_id).call()

    return result

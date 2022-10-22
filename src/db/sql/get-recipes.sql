SELECT
  recipe_group_id,
  networks.name AS network_name,
  dexs.name AS dex_name,
  pairs.pair_id AS pair_db_id,
  pairs.name AS pair_name,
  primary_tokens.token_id AS primary_token_db_id,
  primary_tokens.symbol AS primary_token_symbol,
  primary_tokens.address AS primary_token_address,
  primary_tokens.decimals AS primary_token_decimals,
  secondary_tokens.token_id AS secondary_token_db_id,
  secondary_tokens.symbol AS secondary_token_symbol,
  secondary_tokens.address AS secondary_token_address,
  secondary_tokens.decimals AS secondary_token_decimals,
  pair_market_data.liquidity AS pair_liquidity,
  pair_market_data.volume AS pair_volume,
  pair_market_data.fdv AS pair_fdv,
  networks.network_id AS network_db_id,
  networks.chain_number AS network_chain_number,
  networks.chain_rpc AS network_chain_rpc,
  networks.explorer_tx_url AS network_chain_explorer,
  dexs.dex_id AS dex_db_id,
  dexs.factory AS dex_factory_address,
  dexs.factory_s3_path AS dex_factory_abi,
  dexs.router AS dex_router_address,
  dexs.router_s3_path AS dex_router_abi
FROM
  (
    pairs
    JOIN (
      SELECT
        GROUP_CONCAT(DISTINCT pairs_matches.pair_id) AS ids_group,
        @groupID := ifnull(@groupID,0) + 1 as recipe_group_id,
        pairs_matches.pair_id,
        pairs_matches.name,
        pairs_matches.network_id,
        pairs_matches.dex_id,
        pairs_matches.primary_token_id,
        pairs_matches.secondary_token_id
      FROM
        pairs AS pairs_matches
        INNER JOIN (
          SELECT
            pairs_max_liquidity.pair_id,
            pairs_max_liquidity.name,
            pairs_max_liquidity.network_id,
            pairs_max_liquidity.dex_id,
            pairs_max_liquidity.primary_token_id,
            pairs_max_liquidity.secondary_token_id,
            MAX(pair_market_data_max_liquidity.liquidity) AS pair_liquidity
          FROM
            pairs AS pairs_max_liquidity
            INNER JOIN pair_market_data AS pair_market_data_max_liquidity ON pairs_max_liquidity.pair_id = pair_market_data_max_liquidity.pair_id
          GROUP BY
            pairs_max_liquidity.primary_token_id,
            pairs_max_liquidity.secondary_token_id,
            pairs_max_liquidity.dex_id,
            pairs_max_liquidity.network_id
          ORDER BY
            pairs_max_liquidity.primary_token_id,
            pairs_max_liquidity.secondary_token_id,
            pairs_max_liquidity.dex_id,
            pairs_max_liquidity.network_id
        ) AS pairs_join_liquidity ON pairs_matches.pair_id = pairs_join_liquidity.pair_id
        AND pairs_matches.primary_token_id = pairs_join_liquidity.primary_token_id
        AND pairs_matches.secondary_token_id = pairs_join_liquidity.secondary_token_id
        AND pairs_matches.dex_id = pairs_join_liquidity.dex_id
        AND pairs_matches.network_id = pairs_join_liquidity.network_id
        JOIN networks ON pairs_matches.network_id = networks.network_id
        JOIN dexs ON pairs_matches.dex_id = dexs.dex_id
        JOIN tokens AS primary_tokens ON pairs_matches.primary_token_id = primary_tokens.token_id
        JOIN tokens AS secondary_tokens ON pairs_matches.secondary_token_id = secondary_tokens.token_id
        JOIN pair_market_data ON pairs_matches.pair_id = pair_market_data.pair_id
      WHERE
        dexs.factory IS NOT NULL
        AND dexs.factory_s3_path IS NOT NULL
        AND dexs.router IS NOT NULL
        AND dexs.router_s3_path IS NOT NULL
        AND primary_tokens.address IS NOT NULL
        AND primary_tokens.decimals IS NOT NULL
        AND secondary_tokens.address IS NOT NULL
        AND secondary_tokens.decimals IS NOT NULL
        AND pair_market_data.liquidity > 500
        AND EXISTS (
          SELECT
            routes.token_in_id,
            routes.token_out_id
          FROM
            routes
          WHERE
            routes.token_in_id = primary_tokens.token_id
            AND routes.token_out_id = secondary_tokens.token_id
        )
      GROUP BY
        pairs_matches.primary_token_id,
        pairs_matches.secondary_token_id,
        pairs_matches.network_id
      HAVING
        COUNT(*) > 1
      ORDER BY
        pairs_matches.primary_token_id,
        pairs_matches.secondary_token_id,
        pairs_matches.network_id
    ) AS pairs_multidex ON FIND_IN_SET(pairs.pair_id, pairs_multidex.ids_group)
    JOIN networks ON pairs.network_id = networks.network_id
    JOIN dexs ON pairs.dex_id = dexs.dex_id
    JOIN tokens AS primary_tokens ON pairs.primary_token_id = primary_tokens.token_id
    JOIN tokens AS secondary_tokens ON pairs.secondary_token_id = secondary_tokens.token_id
    JOIN pair_market_data ON pairs.pair_id = pair_market_data.pair_id
  )
ORDER BY
  pairs.primary_token_id,
  pairs.secondary_token_id,
  pairs.dex_id,
  pairs.network_id
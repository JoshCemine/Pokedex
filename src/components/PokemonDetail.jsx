import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, Tab, Tabs, Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';

const PokemonDetail = () => {
  const { id } = useParams();
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      setPokemonDetail(response.data);
    };

    fetchPokemonDetail();
  }, [id]);

  if (!pokemonDetail) return null;

  return (
    <Dialog open onClose={() => window.history.back()} maxWidth='md'>
      <img src={pokemonDetail.sprites.front_default} alt={pokemonDetail.name} />
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="Details" />
        <Tab label="Evolution" />
      </Tabs>
      {tab === 0 && (
        <Typography>
          {/* Display other details here */}
          Name: {pokemonDetail.name}
          {/* Add more details here */}
        </Typography>
      )}
      {tab === 1 && (
        <Typography>
          {/* Fetch and display the evolution details here */}
        </Typography>
      )}
    </Dialog>
  );
};

export default PokemonDetail;

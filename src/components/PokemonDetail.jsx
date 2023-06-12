import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Dialog, Tab, Tabs, Typography } from '@material-ui/core';
import { useNavigate, useParams } from 'react-router-dom';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      setLoading(true);
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      setPokemonDetail(response.data);
      setLoading(false);
    };

    fetchPokemonDetail();
  }, [id]);

  if (!pokemonDetail) return null;

  const navigateTo = (newId) => {
    setLoading(true);
    navigate(`/pokemon/${newId}`);
  }

  return (
    <Dialog open onClose={() => navigate("/")} maxWidth='md'>
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
      <div>
        {id > 1 && (
          <Button 
            variant='contained' 
            color='primary' 
            onClick={() => navigateTo(Number(id) - 1)}
            disabled={loading}
          >
            Previous Pokemon
          </Button>
        )}
        {id < 1010 && (
          <Button 
            variant='contained' 
            color='primary' 
            onClick={() => navigateTo(Number(id) + 1)}
            disabled={loading}
          >
            Next Pokemon
          </Button>
        )}
      </div>
    </Dialog>
  );
};

export default PokemonDetail;

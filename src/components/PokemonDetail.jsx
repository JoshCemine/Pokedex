import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Dialog, Tab, Tabs, Typography } from '@material-ui/core';
import { useNavigate, useParams } from 'react-router-dom';
import './PokemonDetail.css'

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [pokemonWeaknesses, setPokemonWeaknesses] = useState({ weaknesses: [], doubleWeaknesses: [] });
  const [pokemonSpecies, setPokemonSpecies] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [flavorText, setFlavorText] = useState("")

  const fetchPokemonWeaknesses = async (pokemonTypes) => {
    let weaknesses = [];
    let doubleWeaknesses = [];
    let resistances = [];
    let immunities = [];
  
    for (let type of pokemonTypes) {
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      const damageRelations = response.data.damage_relations;
      weaknesses = [...weaknesses, ...damageRelations.double_damage_from.map(d => d.name)];
      resistances = [...resistances, ...damageRelations.half_damage_from.map(d => d.name)];
      immunities = [...immunities, ...damageRelations.no_damage_from.map(d => d.name)];
    }
  
    // Calculate double weaknesses, resistances and immunities
    doubleWeaknesses = weaknesses.filter((value, index, self) => self.indexOf(value) !== self.lastIndexOf(value));
    weaknesses = weaknesses.filter((value, index, self) => self.indexOf(value) === self.lastIndexOf(value)); // only keep unique values
    weaknesses = weaknesses.filter(value => !resistances.includes(value) && !immunities.includes(value)); // cancel out weaknesses that are resisted or immuned
    doubleWeaknesses = [...new Set(doubleWeaknesses.filter(value => !resistances.includes(value) && !immunities.includes(value)))]; // also consider resistances and immunities for double weaknesses
  
    setPokemonWeaknesses({ weaknesses, doubleWeaknesses });
  };

  const fetchPokemonSpecies = async (url) => {
    const response = await axios.get(url);
    setPokemonSpecies(response.data.genera[7].genus);
    setFlavorText(response.data.flavor_text_entries[6].flavor_text);

    const evolutionResponse = await axios.get(response.data.evolution_chain.url);
    let evoData = evolutionResponse.data.chain;
    let evoChain = [];

    do {
      let numberOfEvolutions = evoData['evolves_to'].length;
      let pokemonDetailsResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evoData.species.name}`);
      evoChain.push({
        species_name: evoData.species.name,
        id: pokemonDetailsResponse.data.id,
        sprite: pokemonDetailsResponse.data.sprites.front_default
      });

      if(numberOfEvolutions > 1) {
        for(let i = 1;i < numberOfEvolutions; i++) {
          let pokemonDetailsResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evoData.evolves_to[i].species.name}`);
          evoChain.push({
            species_name: evoData.evolves_to[i].species.name,
            id: pokemonDetailsResponse.data.id,
            sprite: pokemonDetailsResponse.data.sprites.front_default
          });
        }
      }

      evoData = evoData['evolves_to'][0];
    } while (!!evoData && evoData.hasOwnProperty('evolves_to'));

    setEvolutionChain(evoChain);
  };

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      setLoading(true);
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      setPokemonDetail(response.data);
      await fetchPokemonWeaknesses(response.data.types.map((type) => type.type.name));
      await fetchPokemonSpecies(response.data.species.url);
      setLoading(false);
    };

    fetchPokemonDetail();
    console.log(pokemonDetail)
  }, [id]);

  if (!pokemonDetail) return null;

  const navigateTo = (newId) => {
    setLoading(true);
    navigate(`/pokemon/${newId}`);
  }

  return (
    <Dialog open onClose={() => navigate("/")} maxWidth='md'>
      <img className='pokesprite' src={pokemonDetail.sprites.front_default} alt={pokemonDetail.name} />
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="Details" />
        <Tab label="Evolution" />
        <Tab label="Stats" />
      </Tabs>
      {tab === 0 && (
        <Typography>
          <span className='flavor-text'>{flavorText}</span> <br/>
          ID No: {pokemonDetail.id} <br/>
          Name: {pokemonDetail.name[0].toUpperCase() + pokemonDetail.name.substring(1)} <br/>
          Height: {pokemonDetail.height / 10}m <br/>
          Weight: {pokemonDetail.weight / 10}kg <br/>
          Types: {pokemonDetail.types.map((type) =>  type.type.name[0].toUpperCase() + type.type.name.substring(1)).join(", ")} <br/>
          Weaknesses: {pokemonWeaknesses.weaknesses.map(weakness => weakness.charAt(0).toUpperCase() + weakness.slice(1)).join(", ")} <br/>
          Double Weaknesses: {pokemonWeaknesses.doubleWeaknesses.map(weakness => weakness.charAt(0).toUpperCase() + weakness.slice(1)).join(", ")} <br/>
          Species: {pokemonSpecies} <br/>
        </Typography>
      )}
      {tab === 1 && (
        <Typography>
          {evolutionChain.map((pokemon, index) => (
            <div key={pokemon.id}>
              <Button onClick={() => navigateTo(pokemon.id)}>
                <img src={pokemon.sprite} alt={pokemon.species_name} style={{border: pokemon.id === pokemonDetail.id ? '3px solid blue' : 'none'}} />
              </Button>
              {index < evolutionChain.length - 1 && <span>&rarr;</span>}
            </div>
          ))}
        </Typography>
      )}
      {tab === 2 &&(
        <Typography>
            HP: {pokemonDetail.stats[0].base_stat} <br/>
            Attack: {pokemonDetail.stats[1].base_stat} <br/>
            Defense: {pokemonDetail.stats[2].base_stat} <br/>
            Sp. Attack: {pokemonDetail.stats[3].base_stat} <br/>
            Sp. Defense: {pokemonDetail.stats[4].base_stat} <br/>
            Speed: {pokemonDetail.stats[5].base_stat}
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

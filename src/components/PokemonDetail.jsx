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

    let flavor_text_entries = response.data.flavor_text_entries;
    let flavor_text_entries_length = response.data.flavor_text_entries.length
    for(let i = 0; i < flavor_text_entries_length; i++){
      console.log(flavor_text_entries[i])
      if(flavor_text_entries[i].language.name == "en"){
        setFlavorText(flavor_text_entries[i].flavor_text);
        break
      }
    }

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
    <Dialog className='details-modal' open onClose={() => navigate("/")} maxWidth='md'>
      <div className='pokesprite'>
        <img  src={pokemonDetail.sprites.front_default} alt={pokemonDetail.name} />
        <div style={{ textAlign: 'center', marginBottom: '2vw' , fontSize:'2vw' , fontFamily:'monospace' , cursor:"default" }}>
            No. {pokemonDetail.id} {pokemonDetail.name[0].toUpperCase() + pokemonDetail.name.substring(1)} 
        </div>

      </div>      
      <Tabs className='details-modal-tabs' value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="Details" />
        <Tab label="Evolution" />
        <Tab label="Stats" />
      </Tabs>
      {tab === 0 && (
        <div style={{marginLeft: '2vw' , marginRight:'2vw' , marginBottom:'3vw'}}>
        <Typography>
          <span className='flavor-text'>{flavorText}</span> <br/>
          <span className='detail-label'>ID No: {pokemonDetail.id} </span> <br/>
          <span className='detail-label'>Name: {pokemonDetail.name[0].toUpperCase() + pokemonDetail.name.substring(1)} </span><br/>
          <span className='detail-label'>Height: {pokemonDetail.height / 10}m </span><br/>
          <span className='detail-label'>Weight: {pokemonDetail.weight / 10}kg </span><br/>
          <span className='detail-label'> Types: {pokemonDetail.types.map((type) =>  type.type.name[0].toUpperCase() + type.type.name.substring(1)).join(", ")} </span><br/>
          <span className='detail-label'>Weaknesses: {pokemonWeaknesses.weaknesses.map(weakness => weakness.charAt(0).toUpperCase() + weakness.slice(1)).join(", ")} </span><br/>
          <span className='detail-label'>Double Weaknesses: {pokemonWeaknesses.doubleWeaknesses.map(weakness => weakness.charAt(0).toUpperCase() + weakness.slice(1)).join(", ")} </span><br/>
          <span className='detail-label'>Species: {pokemonSpecies} </span><br/>
        </Typography>
        </div>
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
        <div style={{marginLeft: '2vw' , marginRight:'2vw' , marginBottom:'2vw'}}>

        <Typography>

        <div className="skill-bar">
          <div className="skill-bar-label">HP: {pokemonDetail.stats[0].base_stat}</div>
            <div className="skill-bar-value">
              <div className="skill-bar-progress" style={{ width: `${pokemonDetail.stats[0].base_stat/3}%` }}></div>
            </div>
        </div>


        <div className="skill-bar">
          <div className="skill-bar-label">Attack: {pokemonDetail.stats[1].base_stat}</div>
            <div className="skill-bar-value">
              <div className="skill-bar-progress" style={{ width: `${pokemonDetail.stats[1].base_stat/3}%` }}></div>
            </div>
        </div>


        <div className="skill-bar">
          <div className="skill-bar-label">Defense: {pokemonDetail.stats[2].base_stat}</div>
            <div className="skill-bar-value">
              <div className="skill-bar-progress" style={{ width: `${pokemonDetail.stats[2].base_stat/3}%` }}></div>
            </div>
        </div>


        <div className="skill-bar">
          <div className="skill-bar-label">Sp. Attack: {pokemonDetail.stats[3].base_stat}</div>
            <div className="skill-bar-value">
              <div className="skill-bar-progress" style={{ width: `${pokemonDetail.stats[3].base_stat/3}%` }}></div>
            </div>
        </div>


        <div className="skill-bar">
          <div className="skill-bar-label">Sp. Defense: {pokemonDetail.stats[4].base_stat}</div>
            <div className="skill-bar-value">
              <div className="skill-bar-progress" style={{ width: `${pokemonDetail.stats[4].base_stat/3}%` }}></div>
            </div>
        </div>


        <div className="skill-bar">
          <div className="skill-bar-label">Speed: {pokemonDetail.stats[5].base_stat}</div>
            <div className="skill-bar-value">
              <div className="skill-bar-progress" style={{ width: `${pokemonDetail.stats[5].base_stat/3}%` }}></div>
            </div>
        </div>

        </Typography>

        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'center', gap: '1.5vw', marginBottom: '2vw', marginRight:'0.53vw'}}>
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

// PokemonModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PokemonModal.css";

const PokemonModal = ({ pokemon, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [pokemonDetails, setPokemonDetails] = useState(null);
    const [pokemonEvolutions, setPokemonEvolutions] = useState(null);

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            const detailsResponse = await axios.get(pokemon.url);
            setPokemonDetails(detailsResponse.data);

            if (detailsResponse.data.species.url) {
                const speciesResponse = await axios.get(detailsResponse.data.species.url);
                if (speciesResponse.data.evolution_chain.url) {
                    const evolutionResponse = await axios.get(speciesResponse.data.evolution_chain.url);
                    setPokemonEvolutions(evolutionResponse.data);
                }
            }
        };

        fetchPokemonDetails();
    }, [pokemon]);

    const renderTabContent = () => {
        if (activeTab === 'details') {
            // return pokemonDetails && (
            //     // Display pokemon details
            // );
        } else if (activeTab === 'evolutions') {
            // return pokemonEvolutions && (
            //     // Display pokemon evolutions
            // );
        }
    };

    return (
        <div className="pokemon-modal">
            <div className="pokemon-modal-content">
                <img src={pokemonDetails?.sprites.front_default} alt={pokemon.name} />
                <button onClick={onClose}>Close</button>
                <div className="pokemon-modal-tabs">
                    <button onClick={() => setActiveTab('details')}>Details</button>
                    <button onClick={() => setActiveTab('evolutions')}>Evolutions</button>
                </div>
                <div className="pokemon-modal-tab-content">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default PokemonModal;

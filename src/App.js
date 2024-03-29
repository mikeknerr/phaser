import React, { useState, useEffect } from 'react';
import FlexContainer from './FlexContainer';
import styled from 'styled-components'
import { startScript, getUserPlaylists } from './spotify';
import SpotifyLogin from 'react-spotify-login'
import './App.css';

import { Select, MenuItem, Button, TextField, InputLabel } from '@material-ui/core';
import { useFormValues } from './hooks/useFormValues';

function App() {
  const clientId = 'a28916be5f294c4ab1bd8bb6f1c49dd1'; // Your client id
  const redirectUri = process.env.REACT_APP_REDIRECTURI; // Your redirect uri
  const [token, setToken] = useState('');
  const scopes = 'playlist-read-private playlist-modify-private playlist-modify-public'

  const { values, setValues, handleChange } = useFormValues();
  const initialPhaseInfo = {
    num: 1,
    duration: 0,
    playlist: '',
  };
  const [phaseInfo, setPhaseInfo] = useState([{ ...initialPhaseInfo }]);
  const [playlists, setPlaylists] = useState([]);

  const getPlaylists = async () => {
    const playlists = await getUserPlaylists(token);
    setPlaylists(playlists);
    return playlists;
  }

  useEffect(() => {
    if (token) {
      getPlaylists();
    }
  }, [token]);

  useEffect(() => {
    const updatedPhaseInfo = phaseInfo.filter(
      info => info.num <= values.numPhases
    );

    while (updatedPhaseInfo.length < values.numPhases) {
      const newPhase = {
        ...updatedPhaseInfo[updatedPhaseInfo.length - 1],
        num: updatedPhaseInfo.length + 1,
      };
      updatedPhaseInfo.push(newPhase);
    }
    setPhaseInfo(updatedPhaseInfo); // eslint-disable-next-line
  }, [values.numPhases]);

  const handleDynFieldChange = (name, index, value) => {
    const updatedPhaseInfo = [...phaseInfo];
    updatedPhaseInfo[index][name] = value;
    setPhaseInfo(updatedPhaseInfo);
  };

  const handleClick = e => {
    e.preventDefault();
    startScript(token, values.playlistName, phaseInfo)
      .then(result => {
        setValues({});
        setPhaseInfo(initialPhaseInfo)
      })
  }

  const onSuccess = response => {
    setToken(response.access_token);
  };
  const onFailure = response => console.error(response);

  const headers = [];
  for (let i = 1; i <= values.numPhases; i++) {
    headers.push(<th key={i}>{`Phase ${i}`}</th>);
  }

  const duration = phaseInfo.map((info, index) => {
    return (
      <td key={index}>
        <NumericInput
          id={`duration-${index}`}
          name={`duration-${index}`}
          variant='filled'
          label='Duration (Mins)'
          type='number'
          onChange={e =>
            handleDynFieldChange('duration', index, e.target.value)
          }
          value={phaseInfo[index].duration || ''}
          />
      </td>
    );
  });

  const playlistIds = phaseInfo.map((info, index) => {
    const menuItems = playlists.map(playlist => (
      <MenuItem value={playlist.id}>{playlist.name}</MenuItem>
    ))
    return (
      <td key={index}>
      <FlexContainer flexDirection="column">
        <SelectLabel style={{ color: 'white' }}id="playlist-label">Select Playlist</SelectLabel>
        <StyledSelect
          labelId={`playlist-${index}`}
          id={`playlist-${index}`}
          name={`playlist-${index}`}
          value={phaseInfo[index].playlist || ''}
          onChange={e =>
            handleDynFieldChange('playlist', index, e.target.value)
          }
        >
          {menuItems}
        </StyledSelect>
      </FlexContainer>
        {/* <TextInput
          id={`playlist-${index}`}
          name={`playlist-${index}`}
          variant='filled'
          label='Playlist ID or URI'
          type='text'
          onChange={e =>
            handleDynFieldChange('playlist', index, e.target.value)
          }
          value={phaseInfo[index].playlist || ''}
        /> */}
      </td>
    );
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Phaser
        </h1>
        {!token &&
          <SpotifyLogin
            buttonText={token ? 'Success!' : 'Sign in with Spotify'}
            clientId={clientId}
            redirectUri={redirectUri}
            scope={scopes}
            onSuccess={onSuccess}
            onFailure={onFailure}
          />
        }
        {token && (
          <FormContainer flexDirection="column" alignItems="center">
            <ContentContainer flexDirection="column">
              <div>
              <TextInput
                id="playlist-name"
                name="playlistName"
                label="Playlist Name"
                value={values.playlistName}
                onChange={handleChange}
                variant="filled"
                />
                </div>
              <SelectLabel style={{ color: 'white' }} id="num-phases">Number of Phases</SelectLabel>
              <StyledSelect
                labelId="num-phases"
                id="numPhases"
                name="numPhases"
                value={values.numPhases}
                onChange={handleChange}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>
              </StyledSelect>
            </ContentContainer>
            <TableContainer>
              <Table>
                <tbody>
                  <TR>{headers}</TR>
                  <TR>{duration}</TR>
                  <TR>{playlistIds}</TR>
                </tbody>
              </Table>
            </TableContainer>
            <StyledButton
              onClick={handleClick}
              variant="contained"
            >
              Generate Playlist
            </StyledButton>
          </FormContainer>
        )
        }
      </header>
    </div>
  );
}

const FormContainer = styled(FlexContainer)`
  > * {
    margin-bottom: 12px;
  }
`
const ContentContainer = styled(FlexContainer)`
  > * {
    margin-bottom: 18px;
  }
`

const NumericInput = styled(TextField)`
  background-color: white;
`

const SelectLabel = styled(InputLabel)`
  margin-bottom: 12px;
  color: white;
`

const TextInput = styled(TextField)`
  background-color: white;
  width: 300px;
  margin-bottom: 24px;
`

const StyledSelect = styled(Select)`
  background-color: white;
  max-width: 100px;
  color: white;
`

const TableContainer = styled(FlexContainer)`
  max-width: 1100px;
  overflow: scroll;
`;

const Table = styled.table`
  max-width: 800px;
`;

const TR = styled.tr`
  > * {
    padding-right: 24px;
    padding-bottom: 12px;
  }
`;

const StyledButton = styled(Button)`
  background-color: green;
  color: green;
  & .MuiButton-outlined {
    border: 1px solid white;
    color: green;
    background-color: green;
  }
  & .MuiButton-root {
    color: green;
    background-color: green;
  }
`

export default App;

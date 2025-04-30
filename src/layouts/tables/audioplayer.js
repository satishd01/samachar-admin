import React from "react";
import { IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import PropTypes from "prop-types";

function AudioPlayer({ src }) {
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} />
      <IconButton onClick={togglePlay} size="small">
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    </div>
  );
}

AudioPlayer.propTypes = {
  src: PropTypes.string.isRequired,
};

export default AudioPlayer;

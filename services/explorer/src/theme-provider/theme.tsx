import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { theme as TaraxaUiTheme } from '@taraxa_project/taraxa-ui';

export const theme: Theme = createTheme(TaraxaUiTheme, {} as ThemeOptions);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Game } from './components/Game';
import { VisualProvider } from './context/VisualContext';

export default function App() {
  return (
    <VisualProvider>
      <Game />
    </VisualProvider>
  );
}

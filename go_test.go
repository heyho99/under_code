package app

import (
	"fmt"
	"os"
	"regexp"
	"slices"
	"strings"

	"go.keploy.io/server/v3/utils"
	"go.uber.org/zap"
)

func findComposeFile(cmd string) []string {

	cmdArgs := strings.Fields(cmd)
	composePaths := []string{}
	haveMultipleComposeFiles := false

	for i := 0; i < len(cmdArgs); i++ {
		if cmdArgs[i] == "-f" && i+1 < len(cmdArgs) {
			composePaths = append(composePaths, cmdArgs[i+1])
			haveMultipleComposeFiles = true
		}
	}

	if haveMultipleComposeFiles {
		return composePaths
	}

	filenames := []string{"docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"}

	for _, filename := range filenames {
		if _, err := os.Stat(filename); !os.IsNotExist(err) {
			return []string{filename}
		}
	}

	return []string{}
}


func ensureComposeExitOnAppFailure(appCmd, serviceName string) string {
	// If the user already passed one of these flags, don't touch the command.
	if strings.Contains(appCmd, "--abort-on-container-exit") || strings.Contains(appCmd, "--exit-code-from") {
		return appCmd
	}

	// Arguments we want to inject.
	args := []string{"--abort-on-container-exit"}
	if serviceName != "" {
		args = append(args, "--exit-code-from", serviceName)
	}

	parts := strings.Fields(appCmd)
	for i, p := range parts {
		if p == "up" {
			// Insert flags immediately after "up"
			newParts := make([]string, 0, len(parts)+len(args))
			newParts = append(newParts, parts[:i+1]...)
			newParts = append(newParts, args...)
			newParts = append(newParts, parts[i+1:]...)
			return strings.Join(newParts, " ")
		}
	}

	// Fallback: no explicit "up" token detected — do not append flags.
	return appCmd
}
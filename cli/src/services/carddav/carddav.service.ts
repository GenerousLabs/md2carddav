import slugify from "slugify";
import { createDAVClient, DAVObject } from "tsdav";
import { getUidFromVcard } from "../../services/vcard/vcard.service";
import { CommandContext } from "../../shared.types";

export const getVcards = async (
  context: CommandContext
): Promise<{
  [slug: string]: { vcard: DAVObject; uid?: string }[];
}> => {
  const {
    debug,
    config: {
      carddav: { url: serverUrl, username, password },
    },
  } = context;

  const client = await createDAVClient({
    serverUrl,
    authMethod: "Basic",
    credentials: {
      username,
      password,
    },
  });

  debug("Got client #bVoqc1");
  debug(client);

  const account = await client.createAccount({
    account: {
      serverUrl,
      accountType: "carddav",
    },
  });

  debug("Got account #ToupBB");
  debug(account);

  const addressBooks = await client.fetchAddressBooks({ account });

  debug("Got address books #kzx54I");
  debug(addressBooks);

  const vcardsEntries = await Promise.all(
    addressBooks.map(async (addressBook, index) => {
      const key = addressBook.displayName || index.toString();
      const vcards = await client.fetchVCards({
        addressBook,
      });
      const expandedVcards = vcards.map((vcard) => {
        const uidResult = getUidFromVcard(vcard.data);
        return {
          vcard,
          uid: uidResult.success ? uidResult.result : undefined,
        };
      });
      return [key, expandedVcards] as const;
    })
  );

  const vcards = Object.fromEntries(vcardsEntries);

  debug("Got vcards #DN3ahi");
  debug(vcards);

  return vcards;
};

import slugify from "slugify";
import { createDAVClient, DAVObject } from "tsdav";
import { getUidFromVcard } from "../../services/vcard/vcard.service";
import { CommandContext } from "../../shared.types";

const serverUrl = process.env.URL as string;
const username = process.env.USER as string;
const password = process.env.TOKEN as string;

export const getVcards = async ({
  log,
  debug,
}: CommandContext): Promise<{
  [slug: string]: { vcard: DAVObject; uid?: string }[];
}> => {
  const client = await createDAVClient({
    serverUrl,
    authMethod: "Basic",
    credentials: {
      username,
      password,
    },
  });

  log("Got client #bVoqc1");
  debug(client);

  const account = await client.createAccount({
    account: {
      serverUrl,
      accountType: "carddav",
    },
  });

  log("Got account #ToupBB");
  debug(account);

  const addressBooks = await client.fetchAddressBooks({ account });

  log("Got address books #kzx54I");
  debug(addressBooks);

  const vcardsEntries = await Promise.all(
    addressBooks.map(async (addressBook, index) => {
      const slug = slugify(addressBook.displayName || index.toString(), {
        lower: true,
      });
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
      return [slug, expandedVcards] as const;
    })
  );

  const vcards = Object.fromEntries(vcardsEntries);

  log("Got vcards #DN3ahi");
  debug(vcards);

  return vcards;
};
